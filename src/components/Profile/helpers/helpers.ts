import TransferArrowIcon from "../../../../src/assets/icons/transfer-arrow-icon.png";
import SaleIcon from "../../../../src/assets/icons/saleIcon.png";
import Created from "../../../../src/assets/icons/created2.png";
import Minted from "../../../../src/assets/icons/SVG/Minted.svg";
import Listed from "../../../../src/assets/icons/listed-dark.png";
import { walletAddressString } from "utils/helpers/walletAddressString";

const Icons: any = {
  transfer: TransferArrowIcon,
  buy: SaleIcon,
  sale: SaleIcon,
  createCollection: Created,
  minted: Minted,
  list: Listed,
};

const getActivityIcons = (activityType: any) => {
  return Icons[activityType];
};

const getCreatedByNameForCollection = (userId: any) => {
  if (userId?.fullName) return userId?.fullName;
  if (userId?.name) return userId?.name;

  return walletAddressString(userId?.walletAddress);
};

export { getActivityIcons, getCreatedByNameForCollection };
