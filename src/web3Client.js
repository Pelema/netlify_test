import Web3 from 'web3'
// import auctionContractBuild from 'contracts/auction.json'
import auctionContractBuild from './build/contracts/Auction.json'
let currentAccount
let auctionContract
let isInitialized = false

export const initWeb3 = async () => {

    const { ethereum } = window

    if (!ethereum) {
        console.log('Please install Metamask..')
        return

    } else {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            console.log('Found account! Address: ', accounts[0])

            if (accounts.lenght !== 0) {
                console.log('Authorized account found...')
                currentAccount = accounts[0]
            } else {
                console.log('No authorized account found!')
            }
        }catch(error){
            console.log(error)
        }
    }

    /**
     * log when account is changed
     */
    ethereum.on('accountsChanges', (accounts)=>{
        currentAccount = accounts[0]
        console.log('Account changed to: ', accounts[0])
    })

    const web3 = new Web3(ethereum)
    const networkId = await web3.eth.net.getId()
    console.log(networkId, " eth net ", auctionContractBuild.networks)
    auctionContract = new web3.eth.Contract(auctionContractBuild.abi, auctionContractBuild.networks[networkId].address)

    isInitialized = true;
}

export const addItem = async (title, base_price, description, img_url) => {
    if(!isInitialized)
        await initWeb3()

    return auctionContract.methods.addItem(base_price, title, description, img_url).send({from:currentAccount})
}

export const getItems = async () => {
    if(!isInitialized)
        await initWeb3()

    return auctionContract.methods.get().call({from: currentAccount});
}

export const placeBid = async (itemId, amount) => {
    if(!isInitialized)
        await initWeb3()

    return auctionContract.methods.bid(itemId, amount).send({from: currentAccount});
}