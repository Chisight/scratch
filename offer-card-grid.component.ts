import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild, ViewContainerRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import {
  LoaderService,
  CommonService,
  J4uV1Service,
  AemService,
} from 'abs-ngx-library/src/lib/core';
import { GridService } from 'src/app/shared/services/grid.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PaginationService } from 'src/app/shared/services/pagination.service';
import { CommonService as b4UCommonService } from '../../../shared/services/common.service';
import { FilterType } from '../../../shared/models/filter-type';
import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { BannerUnitService } from 'abs-ngx-library/src/lib/banner-unit';
import { LogService } from 'src/app/shared/services/log.service';
import { EnviormentConfig } from 'abs-ngx-library/src/lib/core';
import { B4UService } from 'src/app/shared/services/b4u.service';
import { SortModel } from "../../../shared/models/data.model";
import { SortService, CouponModel } from 'src/app/shared/services/sort.service';
import  {properties}  from 'src/environments/properties';

function getDeviceSize(): string {
  const width = window.innerWidth;
  return width < 768 ? 'sm' : width < 992 ? 'md' : 'lg';
}

@Component({
  selector: 'app-offer-card-grid',
  templateUrl: './offer-card-grid.component.html',
  styleUrls: ['./offer-card-grid.component.scss'],
})
export class OfferCardGridComponent implements OnInit {
  @Input() couponsList: any = [];
  @Input() userInfo: any;
  @Input() displayNoResults: boolean = false;
  @Input() couponGridType: string = 'couponsdeals';
  @Input() isBonusPath: boolean = false;

  private _envConfig: any = EnviormentConfig;
  public configObj = {
    programType: '',
    appName: 'b4uspa',
  };
  public coupons: any = [];
  public baseCoupons: any = [];
  public couponsSecondary: any = [];
  public _window: any = window;
  public sortRules: SortModel[] = [];
  public activeSortRule: any;
  public hasSort: boolean = true;
  public noResults: string = '';
  public pressedState: string = '';
  public filterCategoryParam = '';
  public filterEventParam = '';
  public filterOfferTypeParam = '';
  public filterAisleTypeParam = '';
  public groupByField = 'purchaseInd';
  public currentGroupBy = '';
  public groupByHeadingField = '';
  public isFilter: boolean = false;
  private notAvailableDisp: string[] = ['historylastorder', 'historylist'];
  public allowNotAvailable: boolean = false;
  public areAllCouponsUnavailable: boolean = false;
  //Temporal variable to display title - will be changed with api response
  public showBoxtop: boolean = true;
  public couponGridTitle: string = '';
  public couponGridShowFiltersMobile: boolean = false;
  public couponGridEnableSort: boolean = true;
  public showFilters: boolean = false;
  public filtersData: any;

  // Infinite scroll variables
  public isGroupInit = false;
  public isAisleSort = true;
  public showBackToTopButton: boolean = false;
  public moreScroll: boolean = true;
  public couponChecked: string = 'false';
  public couponsLimit: number = 0;
  public couponGridLink: string = '';
  public couponGridLinkPath: string = '';
  /* Search */
  public filterBySearchParam = '';
  public oncePageLoad: boolean = true;

  /* Load More */
  public isLoadMoreActive: boolean = false;
  public loadType: string = 'loadmore';
  public loadMoreMobileItems: number = 15;
  public loadMoreTabletItems: number = 20;
  public loadMoreDesktopItems: number = 30;
  public infiniteScrollDefaultItems: number = 0;
  public couponToFocus: number = 0;
  public isUserClickFilter = false;

  /* UDC Deals */
  public UDCDealsEnable: boolean = false;
  public UDCDealsHeading: string = '';
  public UDCDealsNoOrderFound: string = '';
  public UDCDealsCouponEventListener: string[] = [];
  public UDCDealsCouponLabel: string = '';
  public UDCDealsCouponFontSize: string = '';
  public UDCDealsCouponTXColor: string = '';
  public UDCDealsCouponBGColor: string = '';
  public UDCDealloadType: string = '';
  public UDCDealmobileNumber: number = 0;
  public UDCDealtabletNumber: number = 0;
  public UDCDealdesktopNumber: number = 0;
  public isLoadMoreActiveUDC: boolean = false;
  public couponsUDC: CouponModel[] = [];
  public couponsSecondaryUDC: CouponModel[] = [];

  /* freshPass */
  public freshPassEnable: boolean = false;
  public freshPassCouponEventListener: string[] = [];

  /*SVG image */
  public logoSVGCouponGridImageEnable: boolean = false;
  public logoSVGCouponGridImage: string = '';
  public id: any;

  /* Selected Search Facets and Selections */
  public selectedSearchSelections = [];
  public logoProps: any;
  /* Behavioral Offer attributes */

  public behavioralOfferAttrs: any;
  public enableFreeSort: any;
  public enableJ4ULogoContainer: boolean = true;
  public bonusPathEmptyMessage: string = '';
  public selectedFilters: FilterType[] = [];
  public _couponTypes: any;
  public modalTitle: string = 'Congratulations!';
  public modalText: string =
    'You completed a [Banner] bonus path & earned one year of FreshPass®! Tap to sign-up and start saving with next-level perks.';
  public modalButtonText: string = 'Claim my prize';
  public checkBoxLabel: string = 'Do not show again';
  public showModal: boolean = true;
  public modalCheckbox: any;
  public allDealsDuplicateBannersDisabled = true;
  public remainingBanners: string[] = [];
  public unlistener: (() => void) | null = null;
  public unlistener2: (() => void) | null = null;
  public searchString: string = '';
  public filteredCouponsOnSearch: any = [];
  public isB2B: boolean = false;

  private banners: string[] = ["midb1", "midb2", "midb3"];
  private deviceSize: string = '';
  @ViewChild('freshPassBonusPathModalButton', { read: ElementRef })
  public freshPassBonusPathModal!: ElementRef;

  constructor(
    private commonService: CommonService,
    private _sortService: SortService,
    private _couponGridService: GridService,
    private _j4uAlV1Service: J4uV1Service,
    private _paginationService: PaginationService,
    private _loaderService: LoaderService,
    private b4uCommonService: b4UCommonService,
    private router: Router,
    private authService: AuthService,
    private absAemService: AemService,
    private _bannerUnitService: BannerUnitService,
    private renderer2: Renderer2,
    private cdRef: ChangeDetectorRef,
    private _logService: LogService,
    private b4UService: B4UService,
  ) {
    const searchParam = document.getElementById(
      'skip-main-content'
    ) as HTMLInputElement;

    this.unlistener = this.renderer2.listen(
      'document',
      'click',
      (event: any) => {
        console.warn(event);
        if (
          event &&
          event.target &&
          event.target.parentElement &&
          event.target.parentElement.className &&
          event.target.parentElement.className.includes('searchBtn')
        ) {
          // event.preventDefault();
          if (event.target.className && event.target.className.includes('svg-icon-search-grey')) {
            if (searchParam && searchParam.value !== '') {
              this.searchListener(searchParam.value);
            }
          }
          if (event.target.className && event.target.className.includes('svg-icon-search-Close')) {
            if (searchParam && searchParam.value !== '') {
              searchParam.value = '';
              this.searchListener(searchParam.value);
            }
          }
        }
      }
    );
    this.unlistener2 = this.renderer2.listen(
      'document',
      'keyup',
      (event: any) => {
        console.warn(event);
        let copiedData: any = '';
        if (document && document.getSelection() && document.getSelection()?.focusNode && document.getSelection()?.focusNode?.nodeValue) {
          copiedData = document.getSelection()?.focusNode?.nodeValue;
        }
        if (
          event &&
          event.target &&
          event.target.id === 'skip-main-content' &&
          event.code &&
          event.code.toLowerCase() === 'enter'
        ) {
          if (searchParam && searchParam.value !== '') {
            this.searchListener(searchParam.value);
          }
        }
        if (searchParam && searchParam.value === '' && copiedData === '') {
          this.searchListener(searchParam.value);
        }
      }
    );
    if (this._window['AB'] && this._window['AB']['COMMON'] && this._window['AB']['COMMON'].getURLParameterByName('q') !== null && this._window['AB']['COMMON'].getURLParameterByName('q') !== '') {
      this.searchString = this._window['AB']['COMMON'].getURLParameterByName('q');
      this.searchString = decodeURIComponent(<string>this.searchString);
      if (searchParam) {
        searchParam.value = this.searchString;
      }
      this.searchListener(this.searchString);
    }
  }

  ngOnInit(): void {
    this.allDealsDuplicateBannersDisabled = this.absAemService.getFeatureFlagByNameDisable('allDealsDuplicateBannersDisabled');
    this._j4uAlV1Service
      .getLogoList()
      .subscribe((data: any) => (this.logoProps = data));
    this.isB2B = this._window?.['AB']?.['userInfo']?.['siteType'] && this._window?.['AB']?.['userInfo']?.['siteType'] === 'B';
    this._couponTypes = this.convertOfferTypes();
    console.warn(this._couponTypes);
    this.b4uCommonService._selectedFiltersRefresh.subscribe(
      (filters: FilterType[]) => {
        console.warn(filters);
        this.selectedFilters = filters;
        this.appendFiltersInUrl();
        if (filters && filters?.length > 0) {
          this.coupons = this.doCouponFilter(this.baseCoupons);
          this.doCouponSort();
          this.displayData();
        }
        filters?.length > 0
          ? this.doCouponFilter(this.couponsList)
          : this.processData();
      }
    );
    this.deviceSize = getDeviceSize();
    this.b4UService.getActiveSortEmitter.subscribe((val: any) => {
      if (val) {
        this.activeSortRuleEmitter(val)
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    this._paginationService.setPaginationNumbers(
      this.loadMoreMobileItems,
      this.loadMoreTabletItems,
      this.loadMoreDesktopItems
    );
    this._j4uAlV1Service.broadcastCompanionGalleryOfferPOST(this.couponsList);
    this.processData();
  }

  ngAfterViewInit() {
    /* Sorting Vars */
    this.hasSort = this._sortService.hasSort();
    this.sortRules = this._sortService.getSorts();
    this.cdRef.detectChanges();
    // Get default sort rule - purchaseRank
    this.activeSortRule = this._sortService.getDefaultSort();
    for (const [index, coupon] of this.couponsSecondary.entries()) {
      const hasUserOptedOut = localStorage.getItem('doNotShowAgainFPBPModal');
      const getDateFromLocalStorage = localStorage.getItem(
        'freshPassModalClosedOn'
      );
      const todaysDate = new Date().toLocaleDateString();
      if (
        coupon?.continuity &&
        coupon?.continuity?.progressValue === coupon?.continuity?.targetValue &&
        coupon?.programSubType &&
        coupon?.programSubType.toLowerCase().trim() === 'ia freshpass'
      ) {
        // this.couponsSecondary.splice(index, 1);
        if (
          !hasUserOptedOut &&
          (!getDateFromLocalStorage || getDateFromLocalStorage < todaysDate)
        ) {
          this.getFreshPassSubscriptionStatus();
        }
      }
    }
  }

  public appendFiltersInUrl() {
    const queryParams = {
      category: '',
      event: '',
      offerPgm: ''
    }

    if (this.selectedFilters && Array.isArray(this.selectedFilters)) {
      this.selectedFilters.forEach((elem: any) => {
        if (elem && elem.filterProperty === 'category') {
          queryParams.category += (queryParams.category === '' ? encodeURIComponent(elem.filterName || '') : `,${encodeURIComponent(elem.filterName || '')}`);
        }
        if (elem && elem.filterProperty === 'events') {
          queryParams.event += (queryParams.event === '' ? encodeURIComponent(elem.filterName || '') : `,${encodeURIComponent(elem.filterName || '')}`);
        }
        if (elem && elem.filterProperty === 'offer-type') {
          queryParams.offerPgm += (queryParams.offerPgm === '' ? encodeURIComponent(elem.filterName || '') : `,${encodeURIComponent(elem.filterName || '')}`);
        }
      });
    }

    console.warn(queryParams);
    if (queryParams.category !== '') {
      window.history.replaceState({}, '', window.location.pathname + this.replaceUrlParam(window.location.search, 'category', queryParams.category));
    } else {
      if (this._window['AB'] && this._window['AB']['COMMON'] && this._window['AB']['COMMON'].removeURLParameterByName) {
        window.history.replaceState({}, '',
          window.location.pathname + this._window['AB']['COMMON'].removeURLParameterByName(window.location.search,
          'category'));
      }
    }
    if (queryParams.event !== '') {
      window.history.replaceState({}, '', window.location.pathname + this.replaceUrlParam(window.location.search, 'event', queryParams.event));
    } else {
      if (this._window['AB'] && this._window['AB']['COMMON'] && this._window['AB']['COMMON'].removeURLParameterByName) {
        window.history.replaceState({}, '',
          window.location.pathname + this._window['AB']['COMMON'].removeURLParameterByName(window.location.search,
          'event'));
      }
    }
    if (queryParams.offerPgm !== '') {
      window.history.replaceState({}, '', window.location.pathname + this.replaceUrlParam(window.location.search, 'offerPgm', queryParams.offerPgm));
    } else {
      if (this._window['AB'] && this._window['AB']['COMMON'] && this._window['AB']['COMMON'].removeURLParameterByName) {
        window.history.replaceState({}, '',
          window.location.pathname + this._window['AB']['COMMON'].removeURLParameterByName(window.location.search,
          'offerPgm'));
      }
    }
  }

  private replaceUrlParam(url: string, paramName: string, paramValue: string) {
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b(' + paramName + '=).*?(&|$)');
    if (url.search(pattern) > -1) {
        return url.replace(pattern, '$1' + paramValue + '$2');
    }
    url = url.replace(/\?$/, '');
    return url + (url.indexOf('?') !== -1 ? '&' : '?') + paramName + '=' + paramValue;
  }

  public filterBySearch(data?: any) {
    let filteredData = [];

    for (let coupon of data && data.length ? data : this.couponsList) {
      if (
        (coupon['brand'] &&
          coupon['brand']
            .toLowerCase()
            .indexOf(this.searchString.toLowerCase()) !== -1) ||
        (coupon['description'] &&
          coupon['description']
            .toLowerCase()
            .indexOf(this.searchString.toLowerCase()) !== -1) ||
        (coupon['disclaimer'] &&
          coupon['disclaimer']
            .toLowerCase()
            .indexOf(this.searchString.toLowerCase()) !== -1) ||
        (coupon['offerPrice'] &&
          coupon['offerPrice']
            .toLowerCase()
            .indexOf(this.searchString.toLowerCase()) !== -1) ||
        (coupon['name'] &&
          coupon['name']
            .toLowerCase()
            .indexOf(this.searchString.toLowerCase()) !== -1)
      ) {
        filteredData.push(coupon);
      }
    }

    return filteredData;
  }

  public searchListener(searchString: string) {
    const closeIconElem = document.querySelector(
      'button.searchBtn i.svg-icon-search-Close'
    );
    const searchIconElem = document.querySelector(
      'button.searchBtn i.svg-icon-search-grey'
    );
    if (searchString !== '') {
      closeIconElem?.setAttribute('style', 'display: block');
      searchIconElem?.setAttribute('style', 'display: none');
    } else {
      closeIconElem?.setAttribute('style', 'display: none');
      searchIconElem?.setAttribute('style', 'display: block');
    }

    this.searchString = searchString;
    this.coupons = this.doCouponFilter(this.baseCoupons);
    this.doCouponSort();
    this.displayData();
    if (this.searchString !== '') {
      window.history.replaceState({}, '', window.location.pathname + this.replaceUrlParam(window.location.search, 'q', encodeURIComponent(this.searchString)));
    } else {
      window.history.replaceState({}, '',
        window.location.pathname + this._window['AB']['COMMON']?.removeURLParameterByName(window.location.search,
        'q'));
    }
  }

  getFreshPassSubscriptionStatus() {
    const banner = this._window['AB']['userInfo']['banner'];
    const displayableBanner = properties.displayableBannerNames[banner as keyof typeof properties.displayableBannerNames] ||  this._window['AB']['userInfo']['displayableBanner'];
    const trademarkSymbol = "\u2122";
    this._j4uAlV1Service.getSubscriptionApiData().subscribe(
      (response: any) => {
        console.warn(response);
      },
      (err: HttpErrorResponse) => {
        console.warn(err);
        if (
          err.status === 404 &&
          err.error &&
          err.error.errorCode === 'OSMS-SUBSCRIPTION-00015'
        ) {
          this.modalText = this.modalText.replace('[Banner]', `${displayableBanner} for U${trademarkSymbol}`);
          this.freshPassBonusPathModal.nativeElement.click();
        }
      }
    );
  }

  private processData() {
    this.coupons = [];

    /* Results Availability Vars */
    this.noResults = this._couponGridService.getNoResultsMsg();
    this.allowNotAvailable =
      this.notAvailableDisp.indexOf(this._window['AB']['couponGridPage']) !==
      -1;

    // this.checkURLParameterByName();
    if (this.couponGridType == 'instant-allocation') {
      this.couponsSecondary = this.couponsList;
      this.couponsSecondaryUDC = [];
    } else {
      this.baseCoupons = this.couponsList;

      this.displayNoResults = !(this.couponsList?.length > 0);

      // if (
      //   this.couponGridType == 'hiddenevents' &&
      //   (this.hiddenEventId == '' ||
      //     this.hiddenEventStoreId == '' ||
      //     (this.hiddenEventId == '' && this.hiddenEventStoreId == ''))
      // ) {
      //   this.displayNoResults = true;
      // }
      this.coupons = this.doCouponFilter(this.couponsList);
      if (this.UDCDealsEnable) {
        [this.couponsUDC, this.coupons] = this.doCouponFilterExtractUDCSpecial(
          this.coupons,
          this.UDCDealsCouponEventListener
        );
        this.doCouponSortUDC();
      }

      this.doCouponSort();

      // Subscribe to back to top button scroll event
      // this._dataScrollService.backToTopScroll$.subscribe((scrollY) => {
      //   let scroll = scrollY || document.documentElement.scrollTop;
      //   this.showBackToTopButton = scroll > window.innerHeight;
      // });

      this.displayData();
    }
  }

  public toggleModalPreference(event: Event) {
    this.modalCheckbox = event.target as HTMLInputElement;
    if (this.modalCheckbox.checked) {
      localStorage.setItem('doNotShowAgainFPBPModal', 'true');
    }
  }

  goToOfferDetailsPage(coupon: any) {
    this._window.location.href = `/loyalty/offer-details/${coupon.offerId}/${coupon.offerPgm}`;
  }

  /* Sort Function */
  public doCouponSort() {
    if (!this.activeSortRule) {
      this.activeSortRule = this._sortService.getDefaultSort();
    }
    this.coupons = this._sortService.couponsSort(
      this.activeSortRule,
      this.coupons
    );
    //Include all data, not only the visible part
    this.coupons = this.multiSort(this.coupons, this.activeSortRule?.field);

    let itemsYouBuy = this.coupons?.filter(
      (coupon: any) => coupon[this.groupByField] === 'B'
    );
    let filteredItemsYouBuyCouponsClipped = itemsYouBuy?.filter(
      (coupon: any) => coupon.status === 'C'
    );
    let filteredItemsYouBuyCouponsUnclipped = itemsYouBuy?.filter(
      (coupon: any) => coupon.status === 'U'
    );

    if (
      Array.isArray(filteredItemsYouBuyCouponsUnclipped) &&
      Array.isArray(filteredItemsYouBuyCouponsClipped)
    ) {
      itemsYouBuy = [
        ...filteredItemsYouBuyCouponsUnclipped,
        ...filteredItemsYouBuyCouponsClipped,
      ];
    }

    let itemsYouLike = this.coupons?.filter(
      (coupon: any) => coupon[this.groupByField] === 'L'
    );
    let filteredItemsYouLikeCouponsClipped = itemsYouLike?.filter(
      (coupon: any) => coupon.status === 'C'
    );
    let filteredItemsYouLikeCouponsUnclipped = itemsYouLike?.filter(
      (coupon: any) => coupon.status === 'U'
    );

    if (
      Array.isArray(filteredItemsYouLikeCouponsUnclipped) &&
      Array.isArray(filteredItemsYouLikeCouponsClipped)
    ) {
      itemsYouLike = [
        ...filteredItemsYouLikeCouponsUnclipped,
        ...filteredItemsYouLikeCouponsClipped,
      ];
    }

    if (Array.isArray(itemsYouBuy) && Array.isArray(itemsYouLike)) {
      this.coupons = [...itemsYouBuy, ...itemsYouLike];
    }

    this.isAisleSort = true;
    this.isGroupInit = false;
    this.currentGroupBy = '';
    this.hasGroupHeading();
  }

  private multiSort(array: CouponModel[], sortCriteria: string): CouponModel[] {
    //Sort criteria lower number first for all the sort selection
    switch (sortCriteria) {
      case 'purchaseRank': {
        array.sort((a: any, b: any) => {
          if (a.purchaseInd === b.purchaseInd) {
            return parseFloat(a.purchaseRank) - parseFloat(b.purchaseRank);
          }
          return b.purchaseInd > a.purchaseInd ? -1 : 1;
        });
        break;
      }

      case 'arrivalRank': {
        array.sort((a: any, b: any) => {
          if (a.purchaseInd === b.purchaseInd) {
            return parseFloat(a.arrivalRank) - parseFloat(b.arrivalRank);
          }
          return b.purchaseInd > a.purchaseInd ? -1 : 1;
        });
        break;
      }

      case 'expiryRank': {
        array.sort((a: any, b: any) => {
          if (a.purchaseInd === b.purchaseInd) {
            return parseFloat(a.expiryRank) - parseFloat(b.expiryRank);
          }
          return b.purchaseInd > a.purchaseInd ? -1 : 1;
        });
        break;
      }
    }
    return array;
  }

  private doCouponFilterExtractUDCSpecial(
    _coupons: any,
    _filterBy: string[]
  ): [CouponModel[], CouponModel[]] {
    if (this.displayNoResults == false && _filterBy?.length > 0) {
      //coupon that match the filter
      let udcCoupons = _coupons?.filter((coupon: any) => {
        if (Array.isArray(coupon.events)) {
          for (let i in coupon.events) {
            if (_filterBy.indexOf(coupon.events[i].toLowerCase()) !== -1) {
              return true;
            }
          }
        }
        return false;
      });
      //coupon that is not in udcCoupons (rest of the coupons)
      let couponWithoutUDC = _coupons?.filter(
        (el: any) => udcCoupons.indexOf(el) < 0
      );
      return [udcCoupons, couponWithoutUDC];
    }
    return [[], _coupons];
  }

  public hasGroupHeading() {
    if (this.hasSort && this.isAisleSort && !this.isGroupInit) {
      this.isGroupInit = true;
      if (this.coupons) {
        this.coupons?.forEach((prod: any) => {
          if (prod[this.groupByField] !== this.currentGroupBy) {
            this.currentGroupBy = prod[this.groupByField];
            prod['isGroupSplit'] = true;
          } else {
            prod['isGroupSplit'] = false;
          }
        });
      }
    }
  }

  public doCouponSortUDC(): void {
    if (!this.activeSortRule) {
      this.activeSortRule = this._sortService.getDefaultSort();
    }

    this.couponsUDC = this._sortService.couponsSort(
      this.activeSortRule,
      this.couponsUDC
    );
    //Include all data, not only the visible part
    this.couponsUDC = this.multiSort(
      this.couponsUDC,
      this.activeSortRule?.field
    );

    let filteredCouponsUDCClipped = this.couponsUDC?.filter(
      (coupon) => coupon.status === 'C'
    );
    let filteredCouponsUDCUnclipped = this.couponsUDC?.filter(
      (coupon) => coupon.status === 'U'
    );

    this.couponsUDC = [
      ...filteredCouponsUDCUnclipped,
      ...filteredCouponsUDCClipped,
    ];
  }

  public displayData() {
    switch (this.loadType) {
      case 'infinitescroll':
        /* Initialize Infinite Scroll */
        // this.infiniteScroll();

        if (this._window['AB'] && this._window['AB']['DATALAYER']) {
          this._window['AB']['DATALAYER'].setCouponsDetails(
            this.coupons?.length,
            this.isUserClickFilter
              ? 'filter selection'
              : this._couponGridService.couponSource
          );
        }
        break;
      case 'loadmore':
        /* Retrieve Coupons based on the number of coupons given */
        this.couponsSecondary = this._paginationService.loadCoupons(
          this.coupons,
          this.isLoadMoreActive
        );

        /* Disable incrementing the Current Number of Items */
        this.isLoadMoreActive = false;

        if (this.UDCDealsEnable) {
          this.couponsSecondaryUDC = this._paginationService.loadCouponsUDC(
            this.couponsUDC,
            this.isLoadMoreActiveUDC
          );
          this.isLoadMoreActiveUDC = false;
        }
        if (this._window['AB'] && this._window['AB']['DATALAYER']) {
          this._window['AB']['DATALAYER'].setCouponsDetails(
            this.coupons?.length,
            this.isUserClickFilter
              ? 'filter selection'
              : this._couponGridService.couponSource
          );
        }
        break;
    }
    console.warn("test-coupons count - display: " + this.couponsSecondary?.length);
    this.remainingBanners = this._bannerUnitService.prepareBannerIndexMap([...this.banners], this.couponsSecondary);
  }

  public filterByCategory(data: any, filters: any) {
    let filteredData: any = [];
    if (data) {
      data?.forEach((coupon: any) => {
        if (
          !coupon['hierarchies'] &&
          coupon['category'].findIndex(
            (category: string) => filters.indexOf(category) > -1
          ) > -1
        ) {
          filteredData.push(coupon);
        } else if (
          coupon['hierarchies']['categories'].findIndex(
            (category: string) => filters.indexOf(category) > -1
          ) > -1
        ) {
          filteredData.push(coupon);
        }
      });
    }
    return filteredData;
  }

  public filterByEvent(data: any, filters: any) {
    let filteredData: any = [];
    if (data) {
      data?.forEach((coupon: any) => {
        if (
          coupon['events'].findIndex(
            (event: string) => filters.indexOf(event) > -1
          ) > -1
        ) {
          filteredData.push(coupon);
        }
      });
    }
    return filteredData;
  }

  public filterByOfferType(data: any, filters: any) {
    let filteredData: any = [];

    if (data && filters) {
      data?.forEach((coupon: any) => {
        filters?.forEach((filter: string) => {
          if (this._couponTypes[filter].indexOf(coupon['offerType']) > -1) {
            filteredData.push(coupon);
          }
        });
      });
    }
    return filteredData;
  }

  public doCouponFilter(data: any) {
      let filteredData = data;
      let categoryFilters: any = [];
      let eventFilters: any = [];
      let offerTypeFilters: any = [];

      if (Array.isArray(this.selectedFilters)) {
        categoryFilters = [
          ...this.selectedFilters
            ?.filter((filter: FilterType) => filter.filterType === 'Category')
            .map((filter: FilterType) => filter.filterName),
        ];
        eventFilters = [
          ...this.selectedFilters
            ?.filter((filter: FilterType) => filter.filterType === 'Events')
            .map((filter: FilterType) => filter.filterName),
        ];
        offerTypeFilters = [
          ...this.selectedFilters
            ?.filter((filter: FilterType) => filter.filterType === 'Offer Type')
            .map((filter: FilterType) => filter.filterName),
        ];
      }
      if (this.searchString !== '') {
        filteredData = this.filterBySearch(filteredData);
      }
      if (filteredData?.length > 0 && categoryFilters?.length > 0) {
        filteredData = this.filterByCategory(filteredData, categoryFilters);
      }
      if (filteredData?.length > 0 && eventFilters?.length > 0) {
        filteredData = this.filterByEvent(filteredData, eventFilters);
      }
      if (filteredData?.length > 0 && offerTypeFilters?.length > 0) {
        filteredData = this.filterByOfferType(filteredData, offerTypeFilters);
      }
      if (filteredData?.length > 0) {
        data = filteredData;
        this.displayNoResults = false; // ACIP-424228
        return data;
      } else {
        data = [];
        this.displayNoResults = true;
        return data;
      }
  }

  public convertOfferTypes() {
    const couponTypes =
      this._window['SWY'].CONFIGSERVICE.nimbusConfig.filterCouponTypes;
    let couponType: any = {};
    let couponTypesEntries = Object.entries(couponTypes);
    if (couponTypesEntries && couponTypesEntries?.length > 0) {
      couponTypesEntries.forEach(([key, value]: any) => {
        if (!couponType[value]) {
          couponType[value] = [key];
        } else {
          couponType[value].push(key);
        }
      });
    }
    return couponType;
  }

  public activeSortRuleEmitter(activeSortRule: SortModel) {
    this.activeSortRule = activeSortRule;

    if (this.UDCDealsEnable) {
      this.doCouponSortUDC();
    }

    //Do multisort and reload the infinite scroll to sort all the data, not only the visible part
    this.doCouponSort();
    this.displayData();
    this.couponToFocus = 0;
  }

  public loadMoreCoupons() {
    this.isLoadMoreActive = true;
    /* Show loading */
    this._loaderService.show();
    this.couponToFocus = this.couponsSecondary
      ? this.couponsSecondary?.length
      : 0;

    /* Retrieve Coupons based on the number of coupons given */
    this.couponsSecondary = this._paginationService.loadCoupons(
      this.coupons,
      this.isLoadMoreActive
    );
    /* Disable incrementing the Current Number of Items */
    this.isLoadMoreActive = false;

    /* Hide Loading */
    this._loaderService.hide();
    // this.focusCoupon();
  }

  public getFocusOn(couponObj: any) {
    this.doCouponSort();
    this.couponsSecondary =
      this.coupons?.length === this.couponsSecondary?.length
        ? [...this.coupons]
        : [...this.coupons.slice(0, this.couponsSecondary?.length)];
    this.couponToFocus = couponObj.couponIndex;
  }

  public onCloseEvent() {
    const closedTime = new Date().toLocaleDateString();
    localStorage.setItem('freshPassModalClosedOn', closedTime.toString());
  }

  public clipCouponErrHandler(coupon: any) {
    if (!this.authService.isTokenValidForSession(this.userInfo)) {
      this.router.navigate(['/loyalty/foru-guest']);
    }
  }

public shouldDisplayBannerAtIndex(index: number): boolean {
    return this._bannerUnitService.shouldDisplayBanner(index);
}
public trackByFn(index: number): any {
  return index + getDeviceSize();
}

  public getCouponList(index: number): any {
    const listMap = this._bannerUnitService.getBannerIndexMap();
    const list = listMap ? Array.from(listMap.keys()) : [];

    // Handle empty list and overflowing index case
    if (list.length === 0 || index > list.length) {
      return index === 0 ? this.couponsSecondary : [];
    }

    // Calculate start and end keys
    const startKey = index > 0 ? list[index - 1] + 1 : 0;
    const endKey = list[index] + 1;

    // When index is out of bounds, return the remaining coupons
    if (index === list.length) {
      return this.couponsSecondary.slice(startKey);
    }

    return this.couponsSecondary.slice(startKey, endKey);
  }

@HostListener('window:resize', ['$event'])
onResize(event:Event): void {
    if(this.deviceSize !== getDeviceSize()) {
      this.remainingBanners = this._bannerUnitService.prepareBannerIndexMap([...this.banners], this.couponsSecondary);
      this.deviceSize = getDeviceSize();
    }
}

ngOnDestroy() {
  if (this.unlistener) {
    this.unlistener();
    this.unlistener = null;
  }
  if (this.unlistener2) {
      this.unlistener2();
      this.unlistener2 = null;
    }
  }
}
