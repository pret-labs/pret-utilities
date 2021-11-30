import { providers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import {
  ChainlinkFeedsRegistry,
  ChainlinkFeedsRegistryInterface,
  PriceFeed,
} from '../cl-feed-registry/index';
import { Denominations } from '../cl-feed-registry/types/ChainlinkFeedsRegistryTypes';
import BaseService from '../commons/BaseService';
import { UiIncentiveDataProviderValidator } from '../commons/validators/methodValidators';
import { isEthAddress } from '../commons/validators/paramValidators';
import { IUiIncentiveDataProviderV3 } from './typechain/IUiIncentiveDataProviderV3';
import { IUiIncentiveDataProviderV3__factory } from './typechain/IUiIncentiveDataProviderV3__factory';
import {
  FullReservesIncentiveDataResponse,
  FullReservesIncentiveDataType,
  IncentiveData,
  IncentiveDataHumanized,
  ReservesIncentiveData,
  ReservesIncentiveDataHumanized,
  RewardInfo,
  UserIncentiveData,
  UserIncentiveDataHumanized,
  UserReservesIncentivesData,
  UserReservesIncentivesDataHumanized,
  UserReservesIncentivesDataType,
  UserRewardInfo,
} from './types';
export * from './types';

export interface UiIncentiveDataProviderInterface {
  getFullReservesIncentiveData: (
    args: FullReservesIncentiveDataType,
  ) => Promise<FullReservesIncentiveDataResponse>;
  getReservesIncentivesData: (
    lendingPoolAddressProvider: string,
  ) => Promise<ReservesIncentiveData[]>;
  getUserReservesIncentivesData: (
    args: UserReservesIncentivesDataType,
  ) => Promise<UserReservesIncentivesData[]>;
  getReservesIncentivesDataHumanized: (
    lendingPoolAddressProvider: string,
  ) => Promise<ReservesIncentiveDataHumanized[]>;
  getUserReservesIncentivesDataHumanized: (
    args: UserReservesIncentivesDataType,
  ) => Promise<UserReservesIncentivesDataHumanized[]>;
  getIncentivesDataWithPrice: (
    args: GetIncentivesDataWithPriceType,
  ) => Promise<ReserveIncentiveWithFeedsResponse[]>;
}
export interface FeedResultSuccessful {
  rewardTokenAddress: string;
  answer: string;
  updatedAt: number;
  decimals: number;
}

export interface GetIncentivesDataWithPriceType {
  lendingPoolAddressProvider: string;
  chainlinkFeedsRegistry?: string;
  quote?: Denominations;
}
export interface UiIncentiveDataProviderContext {
  uiIncentiveDataProviderAddress: string;
  provider: providers.Provider;
}

export class UiIncentiveDataProvider
  extends BaseService<IUiIncentiveDataProviderV3>
  implements UiIncentiveDataProviderInterface
{
  readonly uiIncentiveDataProviderAddress: string;

  private readonly _chainlinkFeedsRegistries: Record<
    string,
    ChainlinkFeedsRegistryInterface
  >;

  /**
   * Constructor
   * @param context The ui incentive data provider context
   */
  public constructor({
    provider,
    uiIncentiveDataProviderAddress,
  }: UiIncentiveDataProviderContext) {
    super(provider, IUiIncentiveDataProviderV3__factory);
    this.uiIncentiveDataProviderAddress = uiIncentiveDataProviderAddress;
    this._chainlinkFeedsRegistries = {};
  }

  /**
   *  Get the full reserve incentive data for the lending pool and the user
   * @param user The user address
   */
  @UiIncentiveDataProviderValidator
  public async getFullReservesIncentiveData(
    @isEthAddress('user')
    @isEthAddress('lendingPoolAddressProvider')
    { user, lendingPoolAddressProvider }: FullReservesIncentiveDataType,
  ): Promise<FullReservesIncentiveDataResponse> {
    const uiIncentiveContract = this.getContractInstance(
      this.uiIncentiveDataProviderAddress,
    );

    return uiIncentiveContract.getFullReservesIncentiveData(
      lendingPoolAddressProvider,
      user,
    );
  }

  /**
   *  Get the reserve incentive data for the lending pool
   */
  @UiIncentiveDataProviderValidator
  public async getReservesIncentivesData(
    @isEthAddress() lendingPoolAddressProvider: string,
  ): Promise<ReservesIncentiveData[]> {
    const uiIncentiveContract = this.getContractInstance(
      this.uiIncentiveDataProviderAddress,
    );

    return uiIncentiveContract.getReservesIncentivesData(
      lendingPoolAddressProvider,
    );
  }

  /**
   *  Get the reserve incentive data for the user
   * @param user The user address
   */
  @UiIncentiveDataProviderValidator
  public async getUserReservesIncentivesData(
    @isEthAddress('user')
    @isEthAddress('lendingPoolAddressProvider')
    { user, lendingPoolAddressProvider }: UserReservesIncentivesDataType,
  ): Promise<UserReservesIncentivesData[]> {
    const uiIncentiveContract = this.getContractInstance(
      this.uiIncentiveDataProviderAddress,
    );

    return uiIncentiveContract.getUserReservesIncentivesData(
      lendingPoolAddressProvider,
      user,
    );
  }

  @UiIncentiveDataProviderValidator
  public async getReservesIncentivesDataHumanized(
    @isEthAddress() lendingPoolAddressProvider: string,
  ): Promise<ReservesIncentiveDataHumanized[]> {
    const response: ReservesIncentiveData[] =
      await this.getReservesIncentivesData(lendingPoolAddressProvider);

    return response.map(r => ({
      underlyingAsset: r.underlyingAsset.toLowerCase(),
      aIncentiveData: this._formatIncentiveData(r.aIncentiveData),
      vIncentiveData: this._formatIncentiveData(r.vIncentiveData),
      sIncentiveData: this._formatIncentiveData(r.sIncentiveData),
    }));
  }

  @UiIncentiveDataProviderValidator
  public async getUserReservesIncentivesDataHumanized({
    user,
    lendingPoolAddressProvider,
  }: UserReservesIncentivesDataType): Promise<
    UserReservesIncentivesDataHumanized[]
  > {
    const response: UserReservesIncentivesData[] =
      await this.getUserReservesIncentivesData({
        user,
        lendingPoolAddressProvider,
      });

    return response.map(r => ({
      underlyingAsset: r.underlyingAsset.toLowerCase(),
      aTokenIncentivesUserData: this._formatUserIncentiveData(
        r.aTokenIncentivesUserData,
      ),
      vTokenIncentivesUserData: this._formatUserIncentiveData(
        r.vTokenIncentivesUserData,
      ),
      sTokenIncentivesUserData: this._formatUserIncentiveData(
        r.sTokenIncentivesUserData,
      ),
    }));
  }

  public async getIncentivesDataWithPrice({
    lendingPoolAddressProvider,
    chainlinkFeedsRegistry,
    quote = Denominations.eth,
  }: GetIncentivesDataWithPriceType): Promise<
    ReserveIncentiveWithFeedsResponse[]
  > {
    const incentives: ReserveIncentiveDataHumanizedResponse[] =
      await this.getReservesIncentivesDataHumanized(lendingPoolAddressProvider);
    const feeds: FeedResultSuccessful[] = [];

    if (chainlinkFeedsRegistry && isAddress(chainlinkFeedsRegistry)) {
      if (!this._chainlinkFeedsRegistries[chainlinkFeedsRegistry]) {
        this._chainlinkFeedsRegistries[chainlinkFeedsRegistry] =
          new ChainlinkFeedsRegistry({
            provider: this._context.provider,
            chainlinkFeedsRegistry,
          });
      }

      const allIncentiveRewardTokens: Set<string> = new Set();

      incentives.forEach(incentive => {
        allIncentiveRewardTokens.add(
          incentive.aIncentiveData.rewardTokenAddress,
        );
        allIncentiveRewardTokens.add(
          incentive.vIncentiveData.rewardTokenAddress,
        );
        allIncentiveRewardTokens.add(
          incentive.sIncentiveData.rewardTokenAddress,
        );
      });

      const incentiveRewardTokens: string[] = Array.from(
        allIncentiveRewardTokens,
      );

      // eslint-disable-next-line @typescript-eslint/promise-function-async
      const rewardFeedPromises = incentiveRewardTokens.map(rewardToken =>
        this._getFeed(rewardToken, chainlinkFeedsRegistry, quote),
      );

      const feedResults = await Promise.allSettled(rewardFeedPromises);

      feedResults.forEach(feedResult => {
        if (feedResult.status === 'fulfilled') feeds.push(feedResult.value);
      });
    }

    return incentives.map(
      (incentive: ReserveIncentiveDataHumanizedResponse) => {
        const aFeed = feeds.find(
          feed =>
            feed.rewardTokenAddress ===
            incentive.aIncentiveData.rewardTokenAddress,
        );
        const vFeed = feeds.find(
          feed =>
            feed.rewardTokenAddress ===
            incentive.vIncentiveData.rewardTokenAddress,
        );
        const sFeed = feeds.find(
          feed =>
            feed.rewardTokenAddress ===
            incentive.sIncentiveData.rewardTokenAddress,
        );

        return {
          underlyingAsset: incentive.underlyingAsset,
          aIncentiveData: {
            ...incentive.aIncentiveData,
            priceFeed: aFeed ? aFeed.answer : '0',
            priceFeedTimestamp: aFeed ? aFeed.updatedAt : 0,
            priceFeedDecimals: aFeed ? aFeed.decimals : 0,
          },
          vIncentiveData: {
            ...incentive.vIncentiveData,
            priceFeed: vFeed ? vFeed.answer : '0',
            priceFeedTimestamp: vFeed ? vFeed.updatedAt : 0,
            priceFeedDecimals: vFeed ? vFeed.decimals : 0,
          },
          sIncentiveData: {
            ...incentive.sIncentiveData,
            priceFeed: sFeed ? sFeed.answer : '0',
            priceFeedTimestamp: sFeed ? sFeed.updatedAt : 0,
            priceFeedDecimals: sFeed ? sFeed.decimals : 0,
          },
        };
      },
    );
  }

  private readonly _getFeed = async (
    rewardToken: string,
    chainlinkFeedsRegistry: string,
    quote: Denominations,
  ): Promise<FeedResultSuccessful> => {
    const feed: PriceFeed = await this._chainlinkFeedsRegistries[
      chainlinkFeedsRegistry
    ].getPriceFeed(rewardToken, quote);

    return {
      ...feed,
      rewardTokenAddress: rewardToken,
    };
  };

  private _formatIncentiveData(data: IncentiveData): IncentiveDataHumanized {
    return {
      tokenAddress: data.tokenAddress,
      incentiveControllerAddress: data.incentiveControllerAddress,
      rewardsTokenInformation: data.rewardsTokenInformation.map(
        (rawRewardInfo: RewardInfo) => ({
          precision: rawRewardInfo.precision,
          rewardTokenAddress: rawRewardInfo.rewardTokenAddress,
          rewardTokenDecimals: rawRewardInfo.rewardTokenDecimals,
          emissionPerSecond: rawRewardInfo.emissionPerSecond.toString(),
          incentivesLastUpdateTimestamp:
            rawRewardInfo.incentivesLastUpdateTimestamp.toNumber(),
          tokenIncentivesIndex: rawRewardInfo.tokenIncentivesIndex.toString(),
          emissionEndTimestamp: rawRewardInfo.emissionEndTimestamp.toNumber(),
          rewardTokenSymbol: rawRewardInfo.rewardTokenSymbol,
          rewardOracleAddress: rawRewardInfo.rewardOracleAddress,
          rewardPriceFeed: rawRewardInfo.rewardPriceFeed.toString(),
          priceFeedDecimals: rawRewardInfo.priceFeedDecimals,
        }),
      ),
    };
  }

  private _formatUserIncentiveData(
    data: UserIncentiveData,
  ): UserIncentiveDataHumanized {
    return {
      tokenAddress: data.tokenAddress,
      incentiveControllerAddress: data.incentiveControllerAddress,
      userRewardsInformation: data.userRewardsInformation.map(
        (userRewardInformation: UserRewardInfo) => ({
          rewardTokenAddress: userRewardInformation.rewardTokenAddress,
          rewardTokenDecimals: userRewardInformation.rewardTokenDecimals,
          tokenIncentivesUserIndex:
            userRewardInformation.tokenIncentivesUserIndex.toString(),
          userUnclaimedRewards:
            userRewardInformation.userUnclaimedRewards.toString(),
          rewardTokenSymbol: userRewardInformation.rewardTokenSymbol,
          rewardOracleAddress: userRewardInformation.rewardOracleAddress,
          rewardPriceFeed: userRewardInformation.rewardPriceFeed.toString(),
          priceFeedDecimals: userRewardInformation.priceFeedDecimals,
        }),
      ),
    };
  }
}
