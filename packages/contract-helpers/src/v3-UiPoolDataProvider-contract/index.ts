import { providers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { IUiPoolDataProvider as UiPoolDataProviderContract } from './typechain/IUiPoolDataProvider';
import { IUiPoolDataProvider__factory } from './typechain/IUiPoolDataProvider__factory';
import {
  ReservesData,
  UserReserveData,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  ReservesDataHumanized,
  UserReserveDataHumanized,
} from './types';

export * from './types';

const ammSymbolMap: Record<string, string> = {
  '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5': 'UNIDAIUSDC',
  '0x004375dff511095cc5a197a54140a24efef3a416': 'UNIWBTCUSDC',
  '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11': 'UNIDAIWETH',
  '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc': 'UNIUSDCWETH',
  '0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f': 'UNIAAVEWETH',
  '0xb6909b960dbbe7392d405429eb2b3649752b4838': 'UNIBATWETH',
  '0x3da1313ae46132a397d90d95b1424a9a7e3e0fce': 'UNICRVWETH',
  '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974': 'UNILINKWETH',
  '0xc2adda861f89bbb333c90c492cb837741916a225': 'UNIMKRWETH',
  '0x8bd1661da98ebdd3bd080f0be4e6d9be8ce9858c': 'UNIRENWETH',
  '0x43ae24960e5534731fc831386c07755a2dc33d47': 'UNISNXWETH',
  '0xd3d2e2692501a5c9ca623199d38826e513033a17': 'UNIUNIWETH',
  '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': 'UNIWBTCWETH',
  '0x2fdbadf3c4d5a8666bc06645b8358ab803996e28': 'UNIYFIWETH',
  '0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5': 'BPTWBTCWETH',
  '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4': 'BPTBALWETH',
};

export interface UiPoolDataProviderContext {
  uiPoolDataProviderAddress: string;
  provider: providers.Provider;
}

export interface UiPoolDataProviderInterface {
  getReservesList: (lendingPoolAddressProvider: string) => Promise<string[]>;
  getReservesData: (
    lendingPoolAddressProvider: string,
  ) => Promise<ReservesData>;
  getUserReservesData: (
    lendingPoolAddressProvider: string,
    user: string,
  ) => Promise<UserReserveData>;
  getReservesHumanized: (
    lendingPoolAddressProvider: string,
  ) => Promise<ReservesDataHumanized>;
  getUserReservesHumanized: (
    lendingPoolAddressProvider: string,
    user: string,
  ) => Promise<UserReserveDataHumanized[]>;
}

export class UiPoolDataProvider implements UiPoolDataProviderInterface {
  private readonly _contract: UiPoolDataProviderContract;

  /**
   * Constructor
   * @param context The ui pool data provider context
   */
  public constructor(context: UiPoolDataProviderContext) {
    if (!isAddress(context.uiPoolDataProviderAddress)) {
      throw new Error('contract address is not valid');
    }

    this._contract = IUiPoolDataProvider__factory.connect(
      context.uiPoolDataProviderAddress,
      context.provider,
    );
  }

  /**
   * Get the underlying asset address for each lending pool reserve
   */
  public async getReservesList(
    lendingPoolAddressProvider: string,
  ): Promise<string[]> {
    if (!isAddress(lendingPoolAddressProvider)) {
      throw new Error('Lending pool address is not valid');
    }

    return this._contract.getReservesList(lendingPoolAddressProvider);
  }

  /**
   * Get data for each lending pool reserve
   */
  public async getReservesData(
    lendingPoolAddressProvider: string,
  ): Promise<ReservesData> {
    if (!isAddress(lendingPoolAddressProvider)) {
      throw new Error('Lending pool address is not valid');
    }

    return this._contract.getReservesData(lendingPoolAddressProvider);
  }

  /**
   * Get data for each user reserve on the lending pool
   */
  public async getUserReservesData(
    lendingPoolAddressProvider: string,
    user: string,
  ): Promise<UserReserveData> {
    if (!isAddress(lendingPoolAddressProvider)) {
      throw new Error('Lending pool address is not valid');
    }

    if (!isAddress(user)) {
      throw new Error('User address is not a valid ethereum address');
    }

    return this._contract.getUserReservesData(lendingPoolAddressProvider, user);
  }

  public async getReservesHumanized(
    lendingPoolAddressProvider: string,
  ): Promise<ReservesDataHumanized> {
    const { 0: reservesRaw, 1: poolBaseCurrencyRaw }: ReservesData =
      await this.getReservesData(lendingPoolAddressProvider);
    console.log('raw reserves: ', reservesRaw);
    const reservesData: ReserveDataHumanized[] = reservesRaw.map(
      reserveRaw => ({
        id: (
          reserveRaw.underlyingAsset + lendingPoolAddressProvider
        ).toLowerCase(),
        underlyingAsset: reserveRaw.underlyingAsset.toLowerCase(),
        name: reserveRaw.name,
        symbol: ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
          ? ammSymbolMap[reserveRaw.underlyingAsset.toLowerCase()]
          : reserveRaw.symbol,
        decimals: reserveRaw.decimals.toNumber(),
        baseLTVasCollateral: reserveRaw.baseLTVasCollateral.toString(),
        reserveLiquidationThreshold:
          reserveRaw.reserveLiquidationThreshold.toString(),
        reserveLiquidationBonus: reserveRaw.reserveLiquidationBonus.toString(),
        reserveFactor: reserveRaw.reserveFactor.toString(),
        usageAsCollateralEnabled: reserveRaw.usageAsCollateralEnabled,
        borrowingEnabled: reserveRaw.borrowingEnabled,
        stableBorrowRateEnabled: reserveRaw.stableBorrowRateEnabled,
        isActive: reserveRaw.isActive,
        isFrozen: reserveRaw.isFrozen,
        liquidityIndex: reserveRaw.liquidityIndex.toString(),
        variableBorrowIndex: reserveRaw.variableBorrowIndex.toString(),
        liquidityRate: reserveRaw.liquidityRate.toString(),
        variableBorrowRate: reserveRaw.variableBorrowRate.toString(),
        stableBorrowRate: reserveRaw.stableBorrowRate.toString(),
        lastUpdateTimestamp: reserveRaw.lastUpdateTimestamp,
        aTokenAddress: reserveRaw.aTokenAddress.toString(),
        stableDebtTokenAddress: reserveRaw.stableDebtTokenAddress.toString(),
        variableDebtTokenAddress:
          reserveRaw.variableDebtTokenAddress.toString(),
        interestRateStrategyAddress:
          reserveRaw.interestRateStrategyAddress.toString(),
        availableLiquidity: reserveRaw.availableLiquidity.toString(),
        totalPrincipalStableDebt:
          reserveRaw.totalPrincipalStableDebt.toString(),
        averageStableRate: reserveRaw.averageStableRate.toString(),
        stableDebtLastUpdateTimestamp:
          reserveRaw.stableDebtLastUpdateTimestamp.toNumber(),
        totalScaledVariableDebt: reserveRaw.totalScaledVariableDebt.toString(),
        priceInMarketReferenceCurrency:
          reserveRaw.priceInMarketReferenceCurrency.toString(),
        variableRateSlope1: reserveRaw.variableRateSlope1.toString(),
        variableRateSlope2: reserveRaw.variableRateSlope2.toString(),
        stableRateSlope1: reserveRaw.stableRateSlope1.toString(),
        stableRateSlope2: reserveRaw.stableRateSlope2.toString(),
        // new fields
        isPaused: reserveRaw.isPaused,
        debtCeiling: reserveRaw.debtCeiling.toString(),
        eModeCategoryId: reserveRaw.eModeCategoryId,
        borrowCap: reserveRaw.borrowCap.toString(),
        supplyCap: reserveRaw.supplyCap.toString(),
        eModeLtv: reserveRaw.eModeLtv,
        eModeLiquidationThreshold: reserveRaw.eModeLiquidationThreshold,
        eModeLiquidationBonus: reserveRaw.eModeLiquidationBonus,
        eModePriceSource: reserveRaw.eModePriceSource.toString(),
        eModeLabel: '', // reserveRaw.eModeLabel.toString(),
      }),
    );

    const baseCurrencyData: PoolBaseCurrencyHumanized = {
      // this is to get the decimals from the unit so 1e18 = string length of 19 - 1 to get the number of 0
      marketReferenceCurrencyDecimals:
        poolBaseCurrencyRaw.marketReferenceCurrencyUnit.toString().length - 1,
      marketReferenceCurrencyPriceInUsd:
        poolBaseCurrencyRaw.marketReferenceCurrencyPriceInUsd.toString(),
      networkBaseTokenPriceInUsd:
        poolBaseCurrencyRaw.networkBaseTokenPriceInUsd.toString(),
      networkBaseTokenPriceDecimals:
        poolBaseCurrencyRaw.networkBaseTokenPriceDecimals,
    };

    return {
      reservesData,
      baseCurrencyData,
    };
  }

  public async getUserReservesHumanized(
    lendingPoolAddressProvider: string,
    user: string,
  ): Promise<UserReserveDataHumanized[]> {
    const { 0: userReservesRaw, 1: userEmodeCategoryId }: UserReserveData =
      await this.getUserReservesData(lendingPoolAddressProvider, user);

    return userReservesRaw.map(userReserveRaw => ({
      underlyingAsset: userReserveRaw.underlyingAsset.toLowerCase(),
      scaledATokenBalance: userReserveRaw.scaledATokenBalance.toString(),
      usageAsCollateralEnabledOnUser:
        userReserveRaw.usageAsCollateralEnabledOnUser,
      stableBorrowRate: userReserveRaw.stableBorrowRate.toString(),
      scaledVariableDebt: userReserveRaw.scaledVariableDebt.toString(),
      principalStableDebt: userReserveRaw.principalStableDebt.toString(),
      stableBorrowLastUpdateTimestamp:
        userReserveRaw.stableBorrowLastUpdateTimestamp.toNumber(),
      userEmodeCategoryId,
    }));
  }
}
