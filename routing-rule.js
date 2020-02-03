import {
    TestController
} from '/controllers/test.controller.js';

export const RoutingRule = [{
    path: '/test/',
    controller: TestController,
    html: '/template/test.html'
}, {
    dependency: [{
        url: '/third-party/jwt-decode.min.js',
        checkVariable: 'jwt_decode'
    }],
    prepareData: [{
        key: 'token',
        func: () => {
            return CookieUtil.getCookie('token');
        }
    }],
    path: '/',
    controller: MainController,
    children: [{
        path: 'signin/',
        controller: SigninController,
        html: '/template/signin.html'
    }, {
        path: 'reset-password/?reset-token&email',
        controller: ResetPasswordAnonymousController,
        html: '/template/reset-password-anonymous.html'
    }, {
        path: 'signup/',
        controller: SignupController,
        html: '/template/signup.html'
    }, {
        path: 'forgot-password/',
        controller: ForgotPasswordController,
        html: '/template/forgot-password.html'
    }, {
        path: 'popup/',
        controller: PopupController,
        children: [{
            path: 'collaterals/?page&size&areaDesc&subAreaDesc&cadasterNo&buildingNo&cadasterOwnerName&buildingOwnerName&excludeIds',
            controller: PopupCollateralsController,
            html: '/template/popup-collaterals.html'
        }]
    }, {
        path: 'dashboard/',
        controller: DashboardController,
        html: '/template/dashboard.html',
        prepareData: [{
            key: 'token',
            func: () => {
                return CookieUtil.getCookie('token');
            }
        }],
        children: [{
            path: 'reset-password/',
            controller: ResetPasswordController,
            html: '/template/reset-password.html'
        }, {
            path: 'users/?page&size&email&status',
            controller: UsersController,
            html: '/template/users.html'
        }, {
            path: 'loans/?page&size&email&name&phone&identityNo&buildingNo&cadasterNo&status&areaDesc&subAreaDesc&sortKey&sortDirection',
            controller: LoansController,
            html: '/template/loans.html',
            dependency: [{
                url: '/third-party/basic-lightbox.min.js',
                checkVariable: 'basicLightbox'
            }, {
                url: '/third-party/moment.min.js',
                checkVariable: 'moment'
            }],
            children: [{
                path: '{id}/?collateralId&debtorId',
                html: '/template/loan.html',
                controller: LoanController,
                dependency: [{
                    url: '/third-party/moment.min.js',
                    checkVariable: 'moment'
                }],
                children: [{
                    path: 'info/',
                    html: '/template/loan-info.html',
                    controller: LoanInfoController,
                    dependency: [{
                        url: '/third-party/tail.datetime.min.js',
                        checkVariable: 'tail'
                    }, {
                        url: '/third-party/auto-complete.min.js',
                        checkVariable: 'autoComplete'
                    }, {
                        url: '/third-party/tw-city-selector.min.js',
                        checkVariable: 'TwCitySelector'
                    }],
                }, {
                    path: 'repay/',
                    controller: LoanRepayController,
                    html: '/template/loan-repay.html',
                    dependency: [{
                        url: '/third-party/tail.datetime.min.js',
                        checkVariable: 'tail'
                    }]
                }, {
                    path: 'summary/',
                    controller: LoanSummaryController,
                    html: '/template/loan-summary.html'
                }]
            }]
        }, {
            path: 'collaterals/?page&size&county&city&areaDesc&subAreaDesc&ownerName&cadasterNo&buildingNo',
            controller: CollateralsController,
            html: '/template/collaterals.html',
            dependency: [{
                url: '/third-party/tw-city-selector.min.js',
                checkVariable: 'TwCitySelector'
            }, {
                url: '/third-party/moment.min.js',
                checkVariable: 'moment'
            }, {
                url: '/third-party/basic-lightbox.min.js',
                checkVariable: 'basicLightbox'
            }]
        }, {
            path: 'debtors/?page&size&identityNo&phone&email&name',
            controller: DebtorsController,
            html: '/template/debtors.html',
            dependency: [{
                url: '/third-party/auto-complete.min.js',
                checkVariable: 'autoComplete'
            }, {
                url: '/third-party/moment.min.js',
                checkVariable: 'moment'
            }, {
                url: '/third-party/basic-lightbox.min.js',
                checkVariable: 'basicLightbox'
            }]
        }, {
            path: 'fundings/?page&size',
            controller: FundingsController,
            html: '/template/fundings.html',
            children: [{
                path: '{id}/?loanId',
                html: '/template/funding.html',
                controller: FundingController,
                children: [{
                    path: 'info/',
                    html: '/template/funding-info.html',
                    controller: FundingInfoController,
                    dependency: [{
                        url: '/third-party/tail.datetime.min.js',
                        checkVariable: 'tail'
                    }]
                }]
            }],
            dependency: [{
                url: '/third-party/moment.min.js',
                checkVariable: 'moment'
            }]
        }]
    }]
}];