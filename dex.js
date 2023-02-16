// State Variables
let oneInchTokensURL = `https://api.1inch.io/v5.0/1/tokens`
const coinpaprikaApiURL = "https://api.coinpaprika.com/v1/coins"
let chosenChain

// HTML Elements
const $selectChainInput = document.getElementById("select-chain")
const $selectChainBtn = document.querySelector(".dex-chain")
const $fromTokenSymbolSelect = document.getElementById("from-token-symbol")
const $tokenAmountInput = document.getElementById("from-token-amount")
const $toTokenSymbolSelect = document.getElementById("to-token-symbol")
const $submitButton = document.getElementById("dex-submit")
const $divResults = document.getElementById("div-results")
const $fromTokenResultsDiv = document.getElementById("div-from-token-results")
const $toTokenResultsDiv = document.getElementById("div-to-token-results")

// Functions to call the APIs
async function fetch1inchData(tickerList) {
	$fromTokenSymbolSelect.innerHTML = `<option value="">Loading...</option>`
	$toTokenSymbolSelect.innerHTML = `<option value="">Loading...</option>`

	oneInchTokensURL = `https://api.1inch.io/v5.0/${chosenChain}/tokens`
	let res = await fetch(oneInchTokensURL)
	let data = await res.json()
	let listOfTokens = Object.values(data.tokens)
	let topTokensList = listOfTokens.filter((token) =>
		tickerList.includes(token.symbol)
	)

	let tokenOptions = topTokensList
		.map(
			(token) =>
				`<option value="${token.address}-${token.decimals}">${token.name} (${token.symbol})</option>`
		)
		.join("")

	$fromTokenSymbolSelect.innerHTML = tokenOptions
	$toTokenSymbolSelect.innerHTML = tokenOptions
}

async function fetchAPICoinPaprikaAndDisplay() {
	let res = await fetch(coinpaprikaApiURL)
	let data = await res.json()
	let filteredData = data
		.filter((obj, index) => index < 100)
		.map((obj) => obj.symbol)
	return filteredData
}

async function handleFormSubmit(event) {
	event.preventDefault()

	chosenChain = Number($selectChainInput.value)
	let fromTokenData = $fromTokenSymbolSelect.value
	let [fromTokenAddress, fromTokenDecimals] = fromTokenData.split("-")
	let toTokenData = $toTokenSymbolSelect.value
	let [toTokenAddress, toTokenDecimals] = toTokenData.split("-")
	let fromTokenUnit = 10 ** fromTokenDecimals
	let fromTokenAmount = $tokenAmountInput.value
	let amount = BigInt(fromTokenAmount * fromTokenUnit)
	console.log(amount)

	const url = `https://api.1inch.exchange/v5.0/${chosenChain}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`
	console.log(url)

	try {
		let res = await fetch(url)
		let data = await res.json()
		console.log(data)

		$fromTokenResultsDiv.innerHTML = `<p class="centered">${
			data.fromToken.name
		} (${data.fromToken.symbol})</p>
		<p>Amount: ${Number(data.fromTokenAmount) / 10 ** Number(fromTokenDecimals)} ${
			data.fromToken.symbol
		}</p>
		<img src="${data.fromToken.logoURI}" alt="${data.fromToken.symbol} logo" />`

		$toTokenResultsDiv.innerHTML = `<p class="centered">${data.toToken.name} (${
			data.toToken.symbol
		})</p>
		<p>Amount: ${(
			Number(data.toTokenAmount) /
			10 ** Number(toTokenDecimals)
		).toFixed(2)} ${data.toToken.symbol}</p>
		<img src="${data.toToken.logoURI}" alt="${data.toToken.symbol} logo" />`
	} catch (e) {
		console.log(e)
	}
}

function alertUser() {
	alert("First, select the chain and click on 'Select Chain' in order to see the quotes!")
}

$submitButton.addEventListener("click", alertUser)

$selectChainBtn.addEventListener("click", (e) => {
	e.preventDefault()
	chosenChain = Number($selectChainInput.value)
	$submitButton.removeEventListener("click", alertUser)
	$submitButton.addEventListener("click", handleFormSubmit)
	fetchAPICoinPaprikaAndDisplay()
		.then(fetch1inchData)
		.then(console.log)
		.catch((e) => console.log(`${e.name}: ${e.message}`))
})
