export const Swissknife = {
    FundingUtilities: {
        // Constant Payment Mortgage loan
        CalculateShouldPaidAmountPerMonthWithCPM: (interestType, amount, yearlyInterestRate, numOfInstalments) => {
            const monthlyInterestRate = yearlyInterestRate / 100 / 12;
            if (interestType === 1) {
                const shouldPaidAmountPerMonth = Math.round(amount * monthlyInterestRate / (1 - Math.pow((1 + monthlyInterestRate), -numOfInstalments)));
                if (shouldPaidAmountPerMonth === -Infinity || shouldPaidAmountPerMonth === Infinity) {
                    return 0;
                }
                return shouldPaidAmountPerMonth;
            } else {
                return Math.round(amount * monthlyInterestRate);
            }
        },
        PredictNextServiceFeeAt: (fundingStartAt, fundingLatestServiceFeeTimestamp, fundingPrepayServiceFeeNumOfInstalments, moment) => {
            let nextRepayAt = null;
            if (fundingLatestServiceFeeTimestamp) {
                nextRepayAt = moment(fundingLatestServiceFeeTimestamp).add(1, 'months').format('YYYY-MM-DD');
            } else {
                nextRepayAt = moment(fundingStartAt).add(fundingPrepayServiceFeeNumOfInstalments, 'months').format('YYYY-MM-DD');
            }
            return nextRepayAt;
        },
        // 用於融資專案還沒建立時，調整 `預付期數` `手續費預付期數` 預測下一期的手續費
        CalculatePredictionAfterPrepay: (base, serviceFeeRate, interestRate, prepayNumOfInstalments, prepayServiceFeeNumOfInstalments, shouldPaidAmountPerMonth) => {
            const monthlyServiceFeeRate = serviceFeeRate / 100 / 12;
            const monthlyInterestRate = interestRate / 100 / 12;
            let result = 0;
            for (let i = 0; i < prepayServiceFeeNumOfInstalments; i++) {
                result += Math.round(base * monthlyServiceFeeRate);
                if (i < prepayNumOfInstalments) {
                    const interestFee = Math.round(base * monthlyInterestRate);
                    if (shouldPaidAmountPerMonth !== 0) {
                        base -= shouldPaidAmountPerMonth - interestFee;
                    }
                }
            }
            return {
                prepayServiceFeeAmount: result,
                afterPrepayAmount: base
            };
        },
        CalculateNextServiceFee: () => {

        }
    },
    getQueryString: (key) => {
        if (!location.search || location.search.substring(1).length === 0) {
            return '';
        }
        const queryStrings = location.search.substring(1).split('&');
        const result = queryStrings.find((qs) => {
            if (qs.indexOf(`${key}=`) === 0) {
                return true;
            } else {
                return false;
            }
        });
        if (result) {
            return decodeURIComponent(result.split('=')[1]);
        }
        return '';
    },
    removeEmptyQueryString: (url) => {
        if (url.indexOf('?') === -1) {
            return url;
        }
        const location = url.substring(0, url.indexOf('?') + 1);
        const queryString = url.substring(url.indexOf('?') + 1);
        const queryArray = queryString.split('&');
        const newQueryArray = [];
        for (let i = 0; i < queryArray.length; i++) {
            if (queryArray[i].split('=')[1] === '') {
                continue;
            }
            newQueryArray.push(queryArray[i]);
        }

        return location + newQueryArray.join('&');
    },
    copyText: (text) => {
        const tempElement = document.createElement('textarea');
        tempElement.value = text;
        tempElement.style.opacity = 0;
        tempElement.style.position = 'fixed';
        tempElement.style.top = 0;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
    },
    calculateLandStackholderSize: (base, fraction, denominator) => {
        let m2 = 0;
        let footage = 0;
        if (
            !isNaN(fraction) &&
            fraction > 0 &&
            !isNaN(denominator) &&
            denominator > 0
        ) {
            m2 = Math.round(base * Number(fraction) / Number(denominator) * 10000) / 10000;
            footage = m2 * 0.3025;
        }
        return {
            m2,
            footage
        };
    },
    decorateLoan: (loan, moment) => {
        const newLoan = JSON.parse(JSON.stringify(loan));
        newLoan.displayAmount = newLoan.amount ? newLoan.amount.toLocaleString('en-US') : '';
        newLoan.displayAppraisedValue = newLoan.appraisedValue ? newLoan.appraisedValue.toLocaleString('en-US') : '';
        newLoan.displayCost = newLoan.cost ? newLoan.cost.toLocaleString('en-US') : '';

        newLoan.displayServiceFee = newLoan.serviceFee ? newLoan.serviceFee.toLocaleString('en-US') : '';
        newLoan.displayCommitionFee = newLoan.commitionFee ? newLoan.commitionFee.toLocaleString('en-US') : '';
        newLoan.startAt = newLoan.startAt ? moment(newLoan.startAt).format('YYYY-MM-DD') : '';
        newLoan.firstPayAt = newLoan.startAt && newLoan.prepayNumOfInstalments !== undefined ? moment(newLoan.startAt).add(newLoan.prepayNumOfInstalments, 'months').format('YYYY-MM-DD') : '';

        newLoan.formatedRepayLoanAmount = newLoan.repayLoanAmount ? newLoan.repayLoanAmount.toLocaleString('en-US') : '';
        newLoan.formatedRepayFundingAmount = newLoan.repayFundingAmount ? newLoan.repayFundingAmount.toLocaleString('en-US') : '';
        newLoan.formatedBalance = ((newLoan.repayLoanAmount || 0) - (newLoan.repayFundingAmount || 0)).toLocaleString('en-US');
        newLoan.formatedFundingAmount = newLoan.fundingAmount ? newLoan.fundingAmount.toLocaleString('en-US') : '';
        newLoan.formatedCost = newLoan.cost ? newLoan.cost.toLocaleString('en-US') : '';
        return newLoan;
    },
    decorateFunding: (funding, moment) => {
        const newFunding = JSON.parse(JSON.stringify(funding));
        newFunding.formatedAmount = newFunding.amount ? newFunding.amount.toLocaleString('en-US') : '';
        newFunding.startAt = newFunding.startAt ? moment(newFunding.startAt).format('YYYY-MM-DD') : '';
        newFunding.firstPayAt = newFunding.startAt ? moment(newFunding.startAt).add(1, 'months').format('YYYY-MM-DD') : '';

        newFunding.repayPerMonth = Swissknife.FundingUtilities.CalculateShouldPaidAmountPerMonthWithCPM(
            newFunding.interestType,
            newFunding.amount,
            newFunding.interestRate,
            newFunding.numOfInstalments
        ).toLocaleString('en-US');

        newFunding.formatedSurplusValue = newFunding.loan.surplusValue.toLocaleString('en-US');
        newFunding.serviceFeePerMonth = 0;
        newFunding.formatedPrepayServiceFeeAmount = newFunding.prepayServiceFeeAmount ? newFunding.prepayServiceFeeAmount.toLocaleString('en-US') : '';

        if (newFunding.interestType === 0) {
            newFunding.labelOfInterestType = '只還息';
        } else {
            newFunding.labelOfInterestType = '本息平攤';
        }
        newFunding.nextRepayAt = Swissknife.predictNextRepayAt(newFunding.startAt, newFunding.latestRepayTimestamp, newFunding.prepayNumOfInstalments, moment);
        newFunding.nextServiceFeeAt = Swissknife.FundingUtilities.PredictNextServiceFeeAt(newFunding.startAt, newFunding.latestServiceFeeTimestamp, newFunding.prepayServiceFeeNumOfInstalments, moment);

        newFunding.nextServiceFee = Math.round(newFunding.amount * newFunding.serviceFeeRate / 12 / 100).toLocaleString('en-US');

        if (newFunding.firstDebtor) {
            newFunding.debtorName = newFunding.firstDebtor.name || '';
            newFunding.debtorId = newFunding.firstDebtor.identityNo || '';
            newFunding.debtorPhone = newFunding.firstDebtor.phone || '';
        } else {
            newFunding.debtorName = '';
            newFunding.debtorId = '';
            newFunding.debtorPhone = '';
        }
        return newFunding;
    },

    predictNextRepayAt: (fundingStartAt, fundingLatestRepayTimestamp, fundingPrepayNumOfInstalments, moment) => {
        let nextRepayAt = null;
        if (fundingLatestRepayTimestamp) {
            nextRepayAt = moment(fundingLatestRepayTimestamp).add(1, 'months').format('YYYY-MM-DD');
        } else {
            nextRepayAt = moment(fundingStartAt).add(fundingPrepayNumOfInstalments + 1, 'months').format('YYYY-MM-DD');
        }
        return nextRepayAt;
    },
    decorateCollateral: (collateral) => {
        const newCollateral = JSON.parse(JSON.stringify(collateral));
        newCollateral.formatCadasterArea = newCollateral.cadasterArea ? newCollateral.cadasterArea.toLocaleString('en-US') : '';
        newCollateral.formatCadasterRightFraction = newCollateral.cadasterRightFraction ? newCollateral.cadasterRightFraction.toLocaleString('en-US') : '';
        newCollateral.formatCadasterRightDenominator = newCollateral.cadasterRightDenominator ? newCollateral.cadasterRightDenominator.toLocaleString('en-US') : '';
        newCollateral.formatBuildingArea = newCollateral.buildingArea ? newCollateral.buildingArea.toLocaleString('en-US') : '';
        newCollateral.formatBuildingRightFraction = newCollateral.buildingRightFraction ? newCollateral.buildingRightFraction.toLocaleString('en-US') : '';
        newCollateral.formatBuildingRightDenominator = newCollateral.buildingRightDenominator ? newCollateral.buildingRightDenominator.toLocaleString('en-US') : '';
        const cadasterRight = Swissknife.calculateLandStackholderSize(newCollateral.cadasterArea, newCollateral.cadasterRightFraction, newCollateral.cadasterRightDenominator);
        const buildingRight = Swissknife.calculateLandStackholderSize(newCollateral.buildingArea, newCollateral.buildingRightFraction, newCollateral.buildingRightDenominator);
        newCollateral.buildingRight = (newCollateral.buildingRightFraction && newCollateral.buildingRightDenominator) ? `${newCollateral.buildingRightFraction.toLocaleString('en-US')} / ${newCollateral.buildingRightDenominator.toLocaleString('en-US')}` : null;
        newCollateral.cadasterRight = (newCollateral.cadasterRightFraction && newCollateral.cadasterRightDenominator) ? `${newCollateral.cadasterRightFraction.toLocaleString('en-US')} / ${newCollateral.cadasterRightDenominator.toLocaleString('en-US')}` : null;
        newCollateral.cadasterRightStakeholderM2 = cadasterRight.m2.toLocaleString('en-US'); // eslint-disable-line 
        newCollateral.cadasterRightStakeholderFootage = cadasterRight.footage.toLocaleString('en-US'); // eslint-disable-line
        newCollateral.cadasterAreaText = newCollateral.cadasterArea ? newCollateral.cadasterArea.toLocaleString('en-US') : ''; // eslint-disable-line
        newCollateral.buildingRightStakeholderM2 = buildingRight.m2.toLocaleString('en-US'); // eslint-disable-line
        newCollateral.buildingRightStakeholderFootage = buildingRight.footage.toLocaleString('en-US'); // eslint-disable-line
        newCollateral.buildingAreaText = newCollateral.buildingArea ? newCollateral.buildingArea.toLocaleString('en-US') : ''; // eslint-disable-line
        newCollateral.formatCarportArea = newCollateral.carportArea ? newCollateral.carportArea.toLocaleString('en-US') : '';
        newCollateral.formatBankCreditAmount = newCollateral.bankCreditAmount ? newCollateral.bankCreditAmount.toLocaleString('en-US') : '';
        newCollateral.formatedBankBalanceAmount = newCollateral.bankBalanceAmount ? newCollateral.bankBalanceAmount.toLocaleString('en-US') : '';
        newCollateral.formatCarportValue = newCollateral.carportValue ? newCollateral.carportValue.toLocaleString('en-US') : '';
        newCollateral.formatLandValueIncrementTax = newCollateral.landValueIncrementTax ? newCollateral.landValueIncrementTax.toLocaleString('en-US') : '';
        newCollateral.formatedUnitPrice = (newCollateral.buildingArea || 0) - (newCollateral.carportArea || 0) === 0 ? '' : (((newCollateral.appraisedValue || 0) - (newCollateral.carportValue || 0)) / ((newCollateral.buildingArea || 0) * 0.3025 - (newCollateral.carportArea || 0))).toLocaleString('en-US');
        newCollateral.formatedAppraisedValue = newCollateral.appraisedValue ? newCollateral.appraisedValue.toLocaleString('en-US') : '';
        return newCollateral;
    },
    decorateLoanLog: (loanLog, loanLogsStatusEnum, loanLogsInterestTypeEnum) => {
        loanLog.formatedAmount = loanLog.amount ? loanLog.amount.toLocaleString('en-US') : '';
        loanLog.formatedPaidAmountOfPrinciple = loanLog.paidAmountOfPrinciple ? loanLog.paidAmountOfPrinciple.toLocaleString('en-US') : '0';
        loanLog.formatedPaidAmountOfInterest = loanLog.paidAmountOfInterest ? loanLog.paidAmountOfInterest.toLocaleString('en-US') : '0';
        loanLog.formatedPaidAt = loanLog.paidAt ? window.moment(loanLog.paidAt).format('YYYY-MM-DD') : '';
        loanLog.formatedCurrentTimestamp = window.moment(loanLog.currentTimestamp).format('YYYY-MM-DD');
        loanLog.interestTypeLabel = loanLogsInterestTypeEnum.labels[loanLog.interestType];
        if (loanLog.isPrepay) {
            loanLog.disabled = 'disabled';
            loanLog.rowEditable = 'disabled';
            loanLog.showUnlockSection = 'hide';
            loanLog.showLockSection = 'hide';
        } else if (loanLog.status === loanLogsStatusEnum.checked) {
            loanLog.disabled = 'disabled';
            loanLog.rowEditable = 'disabled';
            loanLog.showLockSection = '';
            loanLog.showUnlockSection = 'hide';
        } else if (loanLog.status === loanLogsStatusEnum.uncheck) {
            loanLog.disabled = '';
            loanLog.rowEditable = '';
            loanLog.showLockSection = 'hide';
            loanLog.showUnlockSection = '';
        }
    },
    decorateFundingLog: (fundingLog, fundingLogsStatusEnum) => {
        fundingLog.formatedAmount = fundingLog.amount ? fundingLog.amount.toLocaleString('en-US') : '';
        fundingLog.formatedPaidAmountOfPrinciple = fundingLog.paidAmountOfPrinciple ? fundingLog.paidAmountOfPrinciple.toLocaleString('en-US') : '0';
        fundingLog.formatedPaidAmountOfInterest = fundingLog.paidAmountOfInterest ? fundingLog.paidAmountOfInterest.toLocaleString('en-US') : '0';
        fundingLog.formatedPaidAt = fundingLog.paidAt ? window.moment(fundingLog.paidAt).format('YYYY-MM-DD') : '';
        fundingLog.formatedCurrentTimestamp = window.moment(fundingLog.currentTimestamp).format('YYYY-MM-DD');
        if (fundingLog.isPrepay) {
            fundingLog.disabled = 'disabled';
            fundingLog.rowEditable = 'disabled';
            fundingLog.showUnlockSection = 'hide';
            fundingLog.showLockSection = 'hide';
        } else if (fundingLog.status === fundingLogsStatusEnum.checked) {
            fundingLog.disabled = 'disabled';
            fundingLog.rowEditable = 'disabled';
            fundingLog.showLockSection = '';
            fundingLog.showUnlockSection = 'hide';
        } else if (fundingLog.status === fundingLogsStatusEnum.uncheck) {
            fundingLog.disabled = '';
            fundingLog.rowEditable = '';
            fundingLog.showLockSection = 'hide';
            fundingLog.showUnlockSection = '';
        }
    },
    convertVariableToQueryString: (data) => {
        const newQueryStringArray = [];
        for (let key in data) {
            newQueryStringArray.push(`${key}=${encodeURIComponent(data[key])}`);
        }
        return newQueryStringArray.join('&');
    },
    convertUniversalObjectToKeyValueArray: (obj) => {
        const result = [{
            key: '請選擇',
            value: '',
            ttt: ''
        }];
        for (let key in obj.labels) {
            result.push({
                key: obj.labels[key],
                value: key,
                ttt: key
            });
        }
        return result;
    },
    formatNumberInput: (elRoot, selector) => {
        elRoot.querySelectorAll(selector).forEach((elInput) => {
            elInput.addEventListener('keydown', (e) => {
                if (
                    Number.isNaN(Number(e.key)) &&
                    e.key.toLowerCase() !== 'tab' &&
                    e.key.toLowerCase().indexOf('arrow') === -1 &&
                    e.key.toLowerCase() !== 'backspace' &&
                    e.key.toLowerCase() !== '.' &&
                    e.ctrlKey === false &&
                    e.metaKey === false
                ) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            elInput.addEventListener('keyup', (e) => {
                if (Number.isNaN(Number(e.key)) && e.key.toLowerCase() !== 'backspace') {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                const elInputSelf = e.currentTarget;
                const value = elInputSelf.value;
                if (value.length === 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                if (Number(value.replace(/,/gi, '')) === 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
                elInputSelf.value = Number(value.replace(/,/gi, '')).toLocaleString('en-US');
            });
        });
    },
    paddingLeft: (source, length, paddingString) => {
        let result = [source];
        for (let i = 0; i < length - source.length; i++) {
            result.unshift(paddingString);
        }
        return result.join('');
    },
    convertQueryStringToVariable: (queryString) => {
        if(queryString.indexOf('?') !==-1){
            queryString = queryString.substring(queryString.indexOf('?')+1);
        }
        let tempResult = queryString.split('&');
        let result = {};
        for(let i =0 ;i<tempResult.length;i++){
            const queryStringItem = tempResult[i].split('=');
            const key = queryStringItem[0];
            if(queryStringItem[1]){
                const value = queryStringItem[1];
                result[key] = value;
            } else {
                result[key] = '';
            }
        }
        return result;
    },
    appendQueryString: (url, key, value)=> {
        let urlPrefix = url;
        const questionSignPosition = url.indexOf('?');
        if(questionSignPosition!==-1){
            urlPrefix = url.substring(0, questionSignPosition);
            let queryString = url.substring(questionSignPosition+1);
            const queryStringObj = Swissknife.convertQueryStringToVariable(queryString);
            queryStringObj[key] = value;
            return urlPrefix + '?' + Swissknife.convertVariableToQueryString(queryStringObj);
        }
        return `${url}?${key}=${value}`;
    },
    removeUndefinedPropertyTemplateString: (variable, template) => {
        const regex = /({[\w|-|_]+})/g;
        let m;
        let newTemplate = template;
        while ((m = regex.exec(template)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            const variableKey = m[0].substring(1,m[0].length-1);
            if(variable[variableKey] === undefined){
                newTemplate =newTemplate.replace(new RegExp(m[0],'gi'),'');
            }
        }
        return newTemplate;
    }
};