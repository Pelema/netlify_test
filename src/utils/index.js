const Cryptr = require('cryptr');
const moment = require('moment-timezone');

const config = require('../config');

export function debounce(fn, delay) {
    let timer = null;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, arguments), delay);
    };
}

export function termsLink(item) {
    const { terms_link } = item;
    let url = '/legal/terms';
    if (terms_link) {
        url = terms_link;
    }
    return url;
}

export function showProduct(item, profile) {
    const { product_code } = item;
    if (isWealthCreator(product_code)) {
        const { expiry } = profile;
        return moment().isBefore(expiry);
    }
    return true;
}

export function isMyProduct(itemId, myProducts) {
    return myProducts.includes(itemId);
}

export function isCBIX7(code) {
    return code === 'CBIX7';
}

export function isFixedPlan(code) {
    return code === 'FP';
}

export function subscribe(item) {
    const { permakey } = item;
    return window.location = `/products/${permakey}/buy`;
}

export function isFraxion(code) {
    return code === 'FX';
}

export function isWealthCreator(code) {
    return code === config.default.defaults.wc.code;
}

export function allowWCBuy(data) {
    const {
        id,
        myProducts,
        product_code,
        profile,
    } = data;
    if (isWealthCreator(product_code)) {
        if (isMyProduct(id, myProducts)) {
            const { expiry } = profile;
            return (moment().isAfter(moment(expiry)) && !moment().isSame(expiry));
        }
        return true;
    }
    return false;
}

export function formatDatetime(value, format = 'YYYY-MM-DD') {
    const datetime = moment.tz(value, 'Africa/Accra'); 
    return datetime.format(format);
}

export function canInvest(balance, minimum) {
    return (balance && balance > 0 && balance >= parseFloat(minimum));
}

export function canBuyProducts(balance) {
    return (balance && balance > 0);
}

export function getFraxionFees(fees) {
    let feeAmount = 0;
    if (Object.keys(fees).length > 0) {
        Object.keys(fees).map(key => {
            feeAmount += parseFloat(fees[key]);
            return true;
        });
    }
    return feeAmount;
}

export function canBuyFraxion(balance, data) {
    const {
        price,
        fees,
    } = data;
    let feeAmount = 0;
    if (Object.keys(fees).length > 0) {
        Object.keys(fees).map(key => {
            feeAmount += parseFloat(fees[key]);
            return true;
        });
    }
    const amount = parseFloat(price) + feeAmount;
    return (balance && parseFloat(balance) >= amount);
}

export function calculateFraxionTotal(data) {
    const {
        price,
        fees,
    } = data;
    let feeAmount = 0;
    if (Object.keys(fees).length > 0) {
        Object.keys(fees).map(key => {
            feeAmount += parseFloat(fees[key]);
            return true;
        });
    }
    const amount = parseFloat(price) + feeAmount;
    return amount;
}

export function encrypt(val) {
    const cryptr = new Cryptr(config.default.cryptrKey);
    return cryptr.encrypt(val);
}

export function decrypt(encrypted) {
    const cryptr = new Cryptr(config.default.cryptrKey);
    return cryptr.decrypt(encrypted);
}

export function calculateSellCBIX7(data) {
    const {
        exchangeRate,
        tokenAmount, // The number of tokens the member/WC would like to sell at a point in time.
        fees,
        bpt,  // BPT value - configurable attribute on the admin side
        usd,
    } = data;

    // step 1
    let amount = parseFloat(parseFloat(tokenAmount) * parseFloat(bpt));

    // step 2
    // Calculate CBI Dollar value by Dividing the ZAR Value with the USD Value Now
    amount *= usd;

    // Convert the Total CBIs to ZAR Value 
    // Results here/below will give total CBI exchange value (For now ZAR is used: CBI * ZAR value)
    amount /= exchangeRate;

    // ZAR Value / CBI Value configured by Admin
    // amount /= exchangeRate;

    // Subtract slippage fee from revised amount after admin fee deduction | Attribute (slippage_fee)
    // slippage fee is a percentage, use percentage value to calculate fee
    let slippage = 0;
    if (fees.slippage_percentage_sell) slippage = fees.slippage_percentage_sell;
    const feeAmount = parseFloat(amount * (parseFloat(slippage) / 100));
    amount -= feeAmount;

    // return final token amount
    return {
        amount,
        feeAmount,
    };
}

export function canBuyCBIX7(data, amount) {
    if (Object.keys(data).length > 0) {
        const {
            tokenAmount,
            totalAfterFees,
        } = data;

        if (amount > totalAfterFees && tokenAmount && tokenAmount > 0) {
            return true;
        }
    }
    return false;
}

export function calcWCAmount(amount, fees) {
    const {
        registration_fee,
    } = fees;
    let wcAmount = parseFloat(amount);

    // plus registration fee
    if (registration_fee) {
        wcAmount += parseFloat(registration_fee);
    }
    return wcAmount;
}

export function getInvestmentAmount(amount, fees) {
    const {
        registration_fee,
        commission_percentage,
    } = fees;
    let investmentAmount = parseFloat(amount);

    // plus commission percentage
    if (commission_percentage) {
        investmentAmount += (parseFloat(commission_percentage) * investmentAmount / 100);
    }

    // plus registration fee
    if (registration_fee) {
        investmentAmount += parseFloat(registration_fee);
    }
    return investmentAmount;
}

export function calculateBuyCBIX7(data) {
    const {
        exchangeRate,
        bpt,
        usd,
        fees,
        amount,
    } = data;
    let tokenAmount = parseFloat(amount);
    let totalAfterFees = parseFloat(0);

    // Subtract admin fee from entered amount | Attribute (admin_fee)
    let regFee = 0;
    if (fees.admin_fee) regFee = parseFloat(fees.admin_fee);
    const adminFee = regFee;
    tokenAmount -= adminFee;

    // Subtract slippage fee from revised amount after admin fee deduction | Attribute (slippage_fee)
    // slippage fee is a percentage, use percentage value to calculate fee
    let slippage = 0;
    if (fees.slippage_percentage_buy) slippage = fees.slippage_percentage_buy;
    const slippageFee = parseFloat(tokenAmount * (parseFloat(slippage) / 100));
    tokenAmount -= slippageFee;

    // Subtract 3% educator fees from revised amount after slippage fee deduction| Attribute (educators_fee)
    // educator fee is a percentage, use percentage value to calculate fee
    const educatorFee = parseFloat(tokenAmount * (parseFloat(fees.educator_percentage) / 100));
    tokenAmount -= educatorFee;
    totalAfterFees = tokenAmount;

    // Convert the Total CBIs to ZAR Value 
    // Results here/below will give total CBI exchange value (For now ZAR is used: CBI * ZAR value)
    tokenAmount *= exchangeRate;

    // Calculate CBI Dollar value by Dividing the ZAR Value with the USD Value Now
    tokenAmount /= usd;

    // Calculate Token Amount
    // Token Amount = CBI $ Value / BPT value
    tokenAmount /= bpt;

    // return final token amount
    return {
        adminFee,
        slippageFee,
        educatorFee,
        tokenAmount,
        totalAfterFees,
    };
}

export function getActivity(data) {
    const {
        action,
        created,
        section,
        subsection,
        description,
        group_name,
    } = data;
    if (action) {
        switch (action.toLowerCase()) {
            case `${group_name}.login.verify`:
                return {
                    title: 'Logged in',
                    timestamp: moment(created).format('DD MMM hh:mm A'),
                    description: '',
                    icon: '',
                    badge: '',
                };
    
            case `${group_name}.transactions.credit.deposit`:
                return {
                    title: 'Deposit transaction',
                    timestamp: moment(created).format('DD MMM hh:mm A'),
                    description,
                    icon: '',
                    badge: '',
                };
    
            case `${group_name}.transactions.debit.transfer`:
                return {
                    title: 'Transfer transaction',
                    timestamp: moment(created).format('DD MMM hh:mm A'),
                    description,
                    icon: '',
                    badge: '',
                };
    
            case `${group_name}.transactions.debit.withdrawal`:
                return {
                    title: 'Withdrawal transaction',
                    timestamp: moment(created).format('DD MMM hh:mm A'),
                    description,
                    icon: '',
                    badge: '',
                };

            default:
                return {
                    title: `${section} > ${subsection}`,
                    timestamp: moment(created).format('DD MMM hh:mm A'),
                    description,
                    icon: '',
                    badge: '',
                };
        }
    }
    return {};
}