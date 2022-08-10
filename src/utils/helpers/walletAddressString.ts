const walletAddressString = (walletAddress: String) => {
  if (walletAddress?.length > 8) {
    const walletAddressLength = walletAddress?.length;
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(
      walletAddressLength - 4,
      walletAddressLength
    )}`;
  }
};

export { walletAddressString };
