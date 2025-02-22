/* Autogenerated file. Do not edit manually. */
/* eslint-disable */

import { Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';

import type { IAaveIncentivesController } from './IAaveIncentivesController';

export class IAaveIncentivesController__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): IAaveIncentivesController {
    return new Contract(
      address,
      _abi,
      signerOrProvider,
    ) as IAaveIncentivesController;
  }
}

const _abi = [
  {
    inputs: [],
    name: 'DISTRIBUTION_END',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'assets',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'claimRewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
