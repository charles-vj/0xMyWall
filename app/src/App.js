import React , { useEffect, useState } from "react";
import {ethers} from "ethers";
import './App.css';
import abi from './util/WavePortal.json'

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [inputText,setInputText] = useState("");

  const changeInput = (e) => {
    setInputText(e.target.value);
  }

  const contractAddress = "0x84E7157367Af51a89d7C6966fD649b08D5e20bc8";
  const contractABI = abi.abi;

  const checkWallet = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum){
        console.log("no metamask");
        return;
      } else {
         console.log("we have metamask", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }


      
      }
     
    catch (error) {
      console.log(error);
    }
  }

    const connectWallet = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask!");
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]); 
      } catch (error) {
        console.log(error)
      }

  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(inputText);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
        setInputText("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      
      if (ethereum) {
        console.log("Hi!");
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkWallet();
  },[])

  
  
  return (
    <>
    <div class="navbar">
      <div class="logo">
        <a href="#"><h4>Rinkeby Lottery</h4></a>
      </div>
        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button className="connectButton">
            Wallet Connected!
          </button>
        )}
    </div>
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          This is Charles!
        </div>
        <div className="bio">
          Send any message down below to confirm your participation! There is a 0.1% chance that you can win 1 fake ether on the rinkeby testnet &#128064;
        </div>
        <div className="bio">
          Make sure you have connected your wallet first :D
        </div>


        <textarea name="input" id="textinput" cols="10" rows="10" placeholder="Send some cool shit!" className="coolstuff" onChange={changeInput}>{inputText}</textarea>

        <button className="waveButton" onClick={wave}>
          <h1>&#8594;</h1>
        </button>

        <h4 className="entries">Entries!</h4>
        

      {allWaves.map((wave, index) => {
          return (
            <div className = "card" key={index} >
              <div class="details">
              <div className="address">Address: {wave.address}</div>
              <div className="time">Time: {wave.timestamp.toString()}</div></div>
              <div className="message"><p>{wave.message}</p></div>
            </div>)
        })}
      </div>
    </div>
    </>
  );
}
