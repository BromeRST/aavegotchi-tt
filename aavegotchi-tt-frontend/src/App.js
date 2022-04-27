import {useEffect, useState} from "react";
import {ConnectButton} from "./components/ConnectButton";
import { ethers } from "ethers";
import abi from "./utils/abi.json";
import aavegotchiABI from "./utils/aavegotchiABI"
import ierc20ABI from "./utils/ierc20ABI"
import Grid from "./components/Grid";
import Gotchi22133 from "./svg/Gotchi22133.svg"
import Gotchi172 from "./svg/Gotchi172.svg"
import Gotchi1454 from "./svg/Gotchi1454.svg"
import Gotchi2195 from "./svg/Gotchi2195.svg"
import Gotchi3052 from "./svg/Gotchi3052.svg"
import Gotchi9358 from "./svg/Gotchi9358.svg"
import Gotchi12409 from "./svg/Gotchi12409.svg"
import Gotchi21424 from "./svg/Gotchi21424.svg"
import Gotchi21508 from "./svg/Gotchi21508.svg"
import Gotchi22128 from "./svg/Gotchi22128.svg"

const DIAMOND_FORKED_MAINNET_CONTRACT = "0x7Ab5ae9512284fcdE1eB550BE8f9854B4E425702"
const AAVEGOTCHI_FORKED_CONTRACT = "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
const DAI_CONTRACT = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(null);
  const [mainContract, setMainContract] = useState(null);
  const [aavegotchiContract, setAavegotchiContract] = useState(null);
  const [daiContract, setDaiContract] = useState(null);
  const [match, setMatch] = useState(null);
  const [gridMap, setGridMap] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [xToPlay, setXToPlay] = useState(null);
  const [yToPlay, setYToPlay] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      return;
    }

    setProvider(new ethers.providers.Web3Provider(ethereum))

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      setConnected(true);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });

    const polygonChainId = "0x31337"; 
/*     if (chainId !== polygonChainId) {
      alert("You are not connected to the Polygon Network!");
    } */
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      setProvider(new ethers.providers.Web3Provider(ethereum));

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      setCurrentAccount(accounts[0]);
      setConnected(true);
      
      let chainId = await ethereum.request({ method: 'eth_chainId' });

      const polygonChainId = "0x31337"; 
/*       if (chainId !== polygonChainId) {
        alert("You are not connected to the Polygon Network!");
      } */

    } catch (error) {
      console.log(error)
    }
  }

  const register = async () => {
    const gotchiToPlay = [3052, 21424, 9358, 12409, 172]
    await mainContract.register(gotchiToPlay)
  }

  const register2 = async () => {
    const gotchiToPlay = [22133, 1454, 21508, 22128, 2195]
    await mainContract.register(gotchiToPlay)
    let svg;
/*     for (let i = 0; i < gotchiToPlay.length; i ++) {
      svg = await aavegotchiContract.getAavegotchiSvg(gotchiToPlay[i])
      console.log(svg);
    } */
  }

  const getGrid = async () => {
    const grid = await mainContract.getGrid(0); // to pass match id
    setGridMap(grid);
  }

  const playCard = async () => {
    await mainContract.playCard(tokenId, matchId, xToPlay, yToPlay);
    setTimeout(getGrid, 3000);
  }

  const getMatch = async () => {
    const match = await mainContract.getMatch(0);
    console.log("player2", match)
    setMatch(match);
  }

  const checkGotchiParam = async (id) => {
    const params = await aavegotchiContract.getAavegotchi(id);
    return params.modifiedNumericTraits;
  }

  const approve = async () => {
    await daiContract.approve(DIAMOND_FORKED_MAINNET_CONTRACT, ethers.utils.parseUnits("100000000000000000000000000", "ether"));
  }

  const handleMatchId = (e) => {
    setMatchId(Number(e.target.value));
  }

  const handleTokenId = (e) => {
    setTokenId(Number(e.target.value));
  }

  const handleX = (e) => {
    setXToPlay(Number(e.target.value));
  }

  const handleY = (e) => {
    setYToPlay(Number(e.target.value));
  }

  const handleSelectId = (id) => {
    setTokenId(id);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if(provider !== null) {
      setSigner(provider.getSigner());

      setMainContract(
        new ethers.Contract(
          DIAMOND_FORKED_MAINNET_CONTRACT,
          abi,
          signer || provider
        )
      )

      setAavegotchiContract(
        new ethers.Contract(
          AAVEGOTCHI_FORKED_CONTRACT,
          aavegotchiABI,
          signer || provider
        )
      )

      setDaiContract(
        new ethers.Contract(
          DAI_CONTRACT,
          ierc20ABI,
          signer || provider
        )
      )

    }
  }, [currentAccount, provider])

  useEffect(() => {
    if (mainContract) {
      getGrid();
      getMatch();
    }
  }, [mainContract])

/*   useEffect(() => {
    if (match !== null) {
      const p2Gotchis = match.player2Gotchis;
      console.log(p2Gotchis)
      set
 //     checkGotchiParam()
    }
  }, [match]) */

/*   console.log("tok", tokenId)
  console.log("x", xToPlay)
  console.log("y", yToPlay) */

  return (
    <div>
      <div className="nav">
        <p className="app-name">AAVEGOTCHI TT</p>
        <ConnectButton 
          connected={connected}
          setConnected={setConnected}
          currentAccount={currentAccount}
          connectWallet={connectWallet}
        />
      </div>
      <div className="main-wrapper">
        <div>
          <p>PLAYER1 CARDS:</p>
          <div>
            {match !== null && match.player1Gotchis.map((gotchi, i) => (
              <div key={i}>
                <p style={
                  parseInt(ethers.utils.formatUnits(gotchi, 0)) === 3052 ? 
                  {backgroundImage: `url(${Gotchi3052})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                  parseInt(ethers.utils.formatUnits(gotchi, 0)) === 21424 ? 
                  {backgroundImage: `url(${Gotchi21424})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                  parseInt(ethers.utils.formatUnits(gotchi, 0)) === 9358 ? 
                  {backgroundImage: `url(${Gotchi9358})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                  parseInt(ethers.utils.formatUnits(gotchi, 0)) === 12409 ? 
                  {backgroundImage: `url(${Gotchi12409})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                  parseInt(ethers.utils.formatUnits(gotchi, 0)) === 172 && 
                  {backgroundImage: `url(${Gotchi172})`, backgroundColor: "blue", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}
                } onClick={() => handleSelectId(parseInt(ethers.utils.formatUnits(gotchi, 0)))}/>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="btns-container">
            <button onClick={register}>register</button>
            <button onClick={register2}>register2</button>
            <button onClick={approve}>approve</button>
            <button onClick={playCard}>play card</button>
            <button onClick={getMatch}>get match</button>
          </div>
          <div className="inputfields">
            <input placeholder="match id" onChange={handleMatchId}/>
{/*             <input placeholder="token id" onChange={handleTokenId}/>
            <input placeholder="x" onChange={handleX}/>
            <input placeholder="y"onChange={handleY}/> */}
          </div>
          <div className="grid-wrapper">
            {gridMap !== null &&
              <Grid 
                gridMap={gridMap} 
                checkGotchiParam={checkGotchiParam} 
                match={match} 
                setXToPlay={setXToPlay} 
                setYToPlay={setYToPlay}
              />
            }
          </div>
        </div>
        <div>
          <p>PLAYER2 CARDS:</p>
          <div>
          {match !== null && match.player2Gotchis.map((gotchi, i) => (
                <div key={i}>
                  <p style={
                    parseInt(ethers.utils.formatUnits(gotchi, 0)) === 22133 ? 
                    {backgroundImage: `url(${Gotchi22133})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                    parseInt(ethers.utils.formatUnits(gotchi, 0)) === 1454 ? 
                    {backgroundImage: `url(${Gotchi1454})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                    parseInt(ethers.utils.formatUnits(gotchi, 0)) === 21508 ? 
                    {backgroundImage: `url(${Gotchi21508})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                    parseInt(ethers.utils.formatUnits(gotchi, 0)) === 22128 ? 
                    {backgroundImage: `url(${Gotchi22128})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}:
                    parseInt(ethers.utils.formatUnits(gotchi, 0)) === 2195 && 
                    {backgroundImage: `url(${Gotchi2195})`, backgroundColor: "red", backgroundBlendMode: "hard-light", backgroundSize: "cover", backgroundRepeat: "no-repeat", witdh: "200px", height: "200px"}
                  } onClick={() => handleSelectId(parseInt(ethers.utils.formatUnits(gotchi, 0)))}/>
              </div>
            )
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
