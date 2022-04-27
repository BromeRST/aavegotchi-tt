export const ConnectButton = ({
    connected,
    currentAccount,
    connectWallet
  }) => {
  
  
    return (
      <>
        <button
          className="connect-button"
          onClick={async (e) => {
            e.preventDefault()
            connectWallet()
          }}
        >
          {connected ? 
            currentAccount.substring(0,6) +
              "..." + 
            currentAccount.substring(36)
            : "Connect Wallet"}
        </button>
      </>
    )
  }