/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/member-ordering */
import { BigNumber, constants, providers } from 'ethers';
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
  incentivesControllerAddress: string;
};
export interface IncentivesControllerInterface {
  claimRewards: (
    args: ClaimRewardsMethodType,
  ) => EthereumTransactionTypeExtended[];
  DISTRIBUTION_END: (args: DISTRIBUTION_ENDMethodType) => Promise<BigNumber>;
}

export class IncentivesController
  extends BaseService<IAaveIncentivesController>
  implements IncentivesControllerInterface
{
  constructor(provider: providers.Provider) {
    super(provider, IAaveIncentivesController__factory);
  }

  public async DISTRIBUTION_END(
    @isEthAddress('incentivesControllerAddress')
    { incentivesControllerAddress }: DISTRIBUTION_ENDMethodType,
  ) {
    const incentivesContract: IAaveIncentivesController =
      this.getContractInstance(incentivesControllerAddress);
    return incentivesContract.DISTRIBUTION_END();
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
