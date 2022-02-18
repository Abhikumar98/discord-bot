const ethers = require("ethers");
const axios = require("axios");

const getEtherscanTransactions = async (
	currAdress
) => {
	return await axios.get(
		`https://api.etherscan.io/api?module=account&action=tokennfttx&address=${currAdress}&page=1&sort=desc&apikey=I3542R4GUIGY42EGBWUTPAKHEI33UDYGVQ`
	).then((res) => res.data);
};

const calculateProfits = async (asset = [], transactions) => {
const txnHashCount = transactions.reduce(
		(acc, curr) => {
			const { hash } = curr;

			acc[hash] = acc[hash] || 0;
			acc[hash] += 1;

			return acc;
		},
		{}
	);

	// get value of each txnHash
  const mainnetEndpoint =
		"https://speedy-nodes-nyc.moralis.io/d35afcfb3d409232f26629cd/eth/mainnet";
  const provider = new ethers.providers.JsonRpcProvider(mainnetEndpoint);
	const txnHashValue = await Promise.all(
		Object.keys(txnHashCount).map(async (hash) => {
			const response = await provider.getTransaction(hash);
			return ethers.utils.formatEther(response.value);
		})
	);

	// get map of txnHash and value
	const txnHashValueMap = Object.keys(txnHashCount).reduce((acc, curr, index) => {
		acc[curr] = txnHashValue[index];
		return acc;
	}, {});
  const mergedWithMintedTokenPrices = asset.map((asset) => {
		// asset.boughtFor = txnHashValueMap[asset.txn_hash];

		if (asset.last_sale?.total_price) {
			asset.bought_for = ethers.utils.formatEther(
				asset.last_sale.total_price
			);
			return asset;
		}

		const currTxn = transactions.find(
			(txn) => txn.contractAddress === asset.asset_contract.address
		);

		if (currTxn) {
			asset.bought_for = (
				Number(txnHashValueMap[currTxn.hash]) /
				txnHashCount[currTxn.hash]
			).toPrecision(2);
		}

		return asset;
  });

	const groupedAssets = mergedWithMintedTokenPrices.reduce((acc, curr) => {
		const slug = curr.collection?.slug ?? "";
		acc[slug] = acc[slug] || [];
		acc[slug].push(curr);

		return acc;
	}, {});
  
  console.log({ g: groupedAssets["ens"] });

	const result = Object.keys(groupedAssets).map((collectionSlug) => {
		const collection = {
			...groupedAssets[collectionSlug][0].collection,
		};

		const tokens = groupedAssets[collectionSlug].map(
			({ collection, ...t }) => t
		);

		return {
			...collection,
			tokens,
		};
	});

	// if (!defaultData) setAsset(result);

  // console.log(result);

  const allPromises = result.map(async (collection) => {

	const options = {
		method: "GET",
		url: `https://api.opensea.io/api/v1/collection/${collection.slug}/stats`,
		headers: {
			Accept: "application/json",
			// "X-API-KEY": "d0c85ca2a84143c393992626e26c10f7",
		},
	};

	const res = axios
		.request(options)
		.then(function (response) {
			return (response);
		})
		.catch(function (error) {
			console.error(error);
		});

    const { data } = await res;
    return data
	});

  const allStats = await Promise.all(allPromises);
  

	// merge stats with collection
  const merged = result.map((collection, index) => {
    

		return {
			...collection,
			stats: allStats[index]?.stats,
		};
  });
  
console.log({ merged: merged[2].tokens[0]});

	const { costPrice, sellPrice } = merged.reduce(
		(total, curr) => {
      const floorPrice = curr.stats?.floor_price ?? 0;
      
			const investment = curr.tokens.reduce((result, token) => {
				const costPrice = Number(token.bought_for);
        const validatedCostPrice = isNaN(costPrice) ? 0 : costPrice;
        
        console.log({ validatedCostPrice, costPrice, name: curr.slug });

				return validatedCostPrice + result;
			}, 0);

			total.costPrice = total.costPrice + investment;
      total.sellPrice = total.sellPrice + floorPrice * curr.tokens.length;
      
      // console.log({
      //   collection: curr.name,
      //   floorPrice,
      //   investment,
      //   costPrice: total.costPrice + investment,
      //   sellPrice: total.sellPrice + floorPrice * curr.tokens.length,
      // })

			return total;
		},
		{ costPrice: 0, sellPrice: 0 }
	);

	const change =
		!sellPrice && !costPrice
			? Infinity
			: ((sellPrice - costPrice) / costPrice) * 100;

  console.log({
    sellPrice,
    costPrice,
		profitLoss: Number(change.toFixed(2)),
		totalWorth: sellPrice,
  });
  
	return {
		profitLoss: Number(change.toFixed(2)),
		totalWorth: sellPrice,
	};
};

const getOpenseaPage = async (address, page = 0) => {
	console.log(
		"🚀 ~ file: getOpenseaPage.tsx ~ line 13 ~ getOpenseaPage ~ process.env.OPENSEA_API_KEY"
		// process.env.OPENSEA_API_KEY
  );
  const options = {
		method: "GET",
		url: "https://api.opensea.io/api/v1/assets",
		params: {
			owner: address,
			order_direction: "desc",
			offset: "0",
			limit: "50",
		},
		headers: {
			Accept: "application/json",
			"X-API-KEY": "d0c85ca2a84143c393992626e26c10f7",
		},
  };

  const res = axios
		.request(options)
		.then((response) => response)
		.catch(function (error) {
			console.error(error);
    });
  
  const { data } = await res;

  console.log({data})

	return data.assets;
};

const validateAndResolveAddress = async (userAddress) => {
	try {
		const mainnetEndpoint =
			"https://speedy-nodes-nyc.moralis.io/d35afcfb3d409232f26629cd/eth/mainnet";
		const rpcProvider = new ethers.providers.JsonRpcProvider(
			mainnetEndpoint
		);

		const provider = rpcProvider;

		let address, name, avatar;

		console.log({ userAddress });
		console.log(userAddress.includes("."));

		if (userAddress.includes(".")) {
			console.log({ a: userAddress });

			const ensResolver = await provider.resolveName(userAddress);

			console.log({ ensResolver });
			console.log({ userAddress });

			if (!ensResolver) {
				// toast.error("This address is not valid");
				throw new Error("This address is not valid");
			}

			address = ensResolver;
			name = userAddress;
		}

		if (!userAddress.includes(".")) {
			ethers.utils.getAddress(userAddress);

			name = await provider.lookupAddress(userAddress);

			address = userAddress;
		}

		if (name) {
			avatar = await provider.getAvatar(name);
		}

		return { address, name, avatar };
	} catch (error) {
		console.error(error);
		return {};
	}
};

const fetchNFTs = async (currAddress) => {
	const { address } = await validateAndResolveAddress(currAddress);

	console.log({ address });

	// const response = await axios.get(
	//   `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&page=1&offset=100&sort=asc&apikey=I3542R4GUIGY42EGBWUTPAKHEI33UDYGVQ`
	// );
	// const { data } = response;
	// const { result } = data;

	console.log("fetching things from etherscan");

  const transactionsResponse = await getEtherscanTransactions(address);

  
  let transactions = transactionsResponse.result.filter(
	  (tx) => tx.to.toLowerCase() === address.toLowerCase()
	  );
	  
	  console.log("fetching things from opensea");
  const response = await getOpenseaPage(address);
  
  // return { profitLoss: "", totalWorth: "" };

	const { profitLoss, totalWorth } = await calculateProfits(response, transactions);

	return { profitLoss, totalWorth };
};

module.exports = {
	fetchNFTs,
};
