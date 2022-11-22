/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/member-ordering */
import { constants, providers } from 'ethers';
import BaseService from '../commons/BaseService';
import {
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  transactionType,
} from '../commons/types';
import { IncentivesValidator } from '../commons/validators/methodValidators';
import {
  isEthAddress,
  isEthAddressArray,
} from '../commons/validators/paramValidators';
import { IAaveIncentivesController } from './typechain/IAaveIncentivesController';
import { IAaveIncentivesController__factory } from './typechain/IAaveIncentivesController__factory';

export type ClaimRewardsMethodType = {
  user: string;
  assets: string[];
  to?: string;
  incentivesControllerAddress: string;
};

export type DISTRIBUTION_ENDMethodType = {
  user: string;
  incentivesControllerAddress: string;
};
export interface IncentivesControllerInterface {
  claimRewards: (
    args: ClaimRewardsMethodType,
  ) => EthereumTransactionTypeExtended[];
  DISTRIBUTION_END: (
    args: ClaimRewardsMethodType,
  ) => EthereumTransactionTypeExtended[];
}

export class IncentivesController
  extends BaseService<IAaveIncentivesController>
  implements IncentivesControllerInterface
{
  constructor(provider: providers.Provider) {
    super(provider, IAaveIncentivesController__factory);
  }

  public DISTRIBUTION_END(
    @isEthAddress('user')
    @isEthAddress('incentivesControllerAddress')
    { user, incentivesControllerAddress }: DISTRIBUTION_ENDMethodType,
  ) {
    const incentivesContract: IAaveIncentivesController =
      this.getContractInstance(incentivesControllerAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        incentivesContract.populateTransaction.DISTRIBUTION_END(),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.REWARD_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @IncentivesValidator
  public claimRewards(
    @isEthAddress('user')
    @isEthAddress('incentivesControllerAddress')
    @isEthAddress('to')
    @isEthAddressArray('assets')
    { user, assets, to, incentivesControllerAddress }: ClaimRewardsMethodType,
  ): EthereumTransactionTypeExtended[] {
    const incentivesContract: IAaveIncentivesController =
      this.getContractInstance(incentivesControllerAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        incentivesContract.populateTransaction.claimRewards(
          assets,
          constants.MaxUint256.toString(),
          to ?? user,
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.REWARD_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
