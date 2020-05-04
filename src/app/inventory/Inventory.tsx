import React, { useEffect } from 'react';
import { DestinyAccount } from '../accounts/destiny-account';
import { Loading } from '../dim-ui/Loading';
import Stores from './Stores';
import { D1StoresService } from './d1-stores';
import { D2StoresService } from './d2-stores';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import ClearNewItems from './ClearNewItems';
import StackableDragHelp from './StackableDragHelp';
import LoadoutDrawer from '../loadout/LoadoutDrawer';
import { refresh$ } from '../shell/refresh';
import Compare from '../compare/Compare';
import D2Farming from '../farming/D2Farming';
import D1Farming from '../farming/D1Farming';
import InfusionFinder from '../infuse/InfusionFinder';
import { queueAction } from './action-queue';
import ErrorBoundary from 'app/dim-ui/ErrorBoundary';
import DragPerformanceFix from 'app/inventory/DragPerformanceFix';
import { storesLoadedSelector } from './selectors';
import { useSubscription } from 'app/utils/hooks';

interface ProvidedProps {
  account: DestinyAccount;
}

interface StoreProps {
  storesLoaded: boolean;
}

type Props = ProvidedProps & StoreProps;

function mapStateToProps(state: RootState): StoreProps {
  return {
    storesLoaded: storesLoadedSelector(state)
  };
}

function getStoresService(account: DestinyAccount) {
  return account.destinyVersion === 1 ? D1StoresService : D2StoresService;
}

function Inventory({ storesLoaded, account }: Props) {
  useSubscription(() => {
    const storesService = getStoresService(account);
    return refresh$.subscribe(() => queueAction(() => storesService.reloadStores()));
  });

  useEffect(() => {
    const storesService = getStoresService(account);
    if (!storesLoaded) {
      console.log('loading stores for', account);
      // TODO: Dispatch an action to load stores instead
      storesService.getStoresStream(account);
    }
  }, [account, storesLoaded]);

  if (!storesLoaded) {
    return <Loading />;
  }

  return (
    <ErrorBoundary name="Inventory">
      <Stores />
      <LoadoutDrawer />
      <Compare />
      <StackableDragHelp />
      <DragPerformanceFix />
      {account.destinyVersion === 1 ? <D1Farming /> : <D2Farming />}
      <InfusionFinder destinyVersion={account.destinyVersion} />
      <ClearNewItems account={account} />
    </ErrorBoundary>
  );
}

export default connect<StoreProps>(mapStateToProps)(Inventory);
