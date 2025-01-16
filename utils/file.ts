import fs from "fs"
import { Chain } from "./chain"

export type Addresses = {
	symmioAddress?: string
	collateralAddress?: string
	multiAccountAddress?: string
	hedgerProxyAddress?: string
	MulticallAddress?: string
}

const getFilePath = (chain: Chain, version: number) => `./output/addresses${"-" + chain + version.toString()}.json`

export function loadAddresses(chain: Chain, version: number): Addresses {
	console.log("Loading addresses on: ", chain)
	const filePath = getFilePath(chain, version)
	console.log("File path to addresses", filePath)

	let output: Addresses = {}
	if (fs.existsSync(filePath)) {
		output = JSON.parse(fs.readFileSync(filePath, "utf8"))
	} else {
		if (!fs.existsSync("./output")) fs.mkdirSync("./output")
		output = {}
		fs.writeFileSync(filePath, JSON.stringify(output))
	}
	return output
}

export function saveAddresses(content: Addresses, chain: Chain, version: number): void {
	const filePath = getFilePath(chain, version)
	console.log("File path to addresses", filePath)

	if (!fs.existsSync(filePath)) {
		if (!fs.existsSync("./output")) fs.mkdirSync("./output")
	}
	fs.writeFileSync(filePath, JSON.stringify(content))
}
