const PRODUCTS = {
    'ult_small': { id: 1, code: 'ult_small', name: 'Unlimited 1GB', price: 24.90 },
    'ult_medium': { id: 2, code: 'ult_medium', name: 'Unlimited 2GB', price: 29.90 },
    'ult_large': { id: 3, code: 'ult_large', name: 'Unlimited 5GB', price: 44.90 },
    '1gb': { id: 4, code: '1gb', name: '1 GB Data-pack', price: 9.90 },
}
class ShoppingCart {
    constructor(pricingRules) {
        this.cartItems = [];
        this.pricingRules = pricingRules;
        this.promoCode = '';
    }

    add(item, promoCode = '') {
        this.cartItems.push(item);

        if (promoCode) {
            this.promoCode = promoCode;
        }

        return this;
    }

    total() {
        const result = this.pricingRules.applyRules(this.cartItems, this.promoCode);
        return result.total.toFixed(2);
    }
      
    get listOfItems() {
        const result = this.pricingRules.applyRules(this.cartItems, this.promoCode);
        return result.items;
    }

    formatItems() {
        const result = this.pricingRules.applyRules(this.cartItems);
        const items = result.items;

        const itemCounts = {};
        items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
        });
    
        return Object.entries(itemCounts).map(([name, count]) => `${count} x ${name}`).join(', ');
    }
}


class PricingRules {
    applyRules(cartItems, promoCode) {
        let total = 0;
        let items = [...cartItems];
        let additionalItems = [];
        let promo = promoCode;
    
        const count = {};
        items.forEach(item => {
            count[item.code] = (count[item.code] || 0) + 1;
        });
    
        // Bundle promo for Unlimited 1GB (buy 3, pay 2)
        if (count['ult_small'] >= 3) {
            let totalItems = count['ult_small'];
            let freeItems = 0;

            while (totalItems >= 3) {
                freeItems += 1;  
                totalItems -= 3; 
            }

            total -= freeItems * PRODUCTS['ult_small'].price;
        }
    
        // Bulk promo for Unlimited 5GB (more than 3)
        if (count['ult_large'] > 3) {
            let originalPrice = count['ult_large'] * PRODUCTS['ult_large'].price;
            let promoPrice = count['ult_large'] * 39.90;

            total -= originalPrice;
            total += promoPrice;
        }
    
        // Bundle free 1GB Data-pack with every Unlimited 2GB
        if (count['ult_medium'] > 0) {
            for (let i = 0; i < count['ult_medium']; i++) {
                additionalItems.push(PRODUCTS['1gb']);
            }
        }
    
        items.forEach(item => {
            total += item.price;
        });
        
        // Apply promo code discount if applicable
        if (promo === 'I<3AMAYSIM') {
            total *= 0.9; // 10% discount
        }
        
        return {
            total: total,
            items: [...items, ...additionalItems]
        };
    }
}



function runTests() {
    const pricingRules = new PricingRules();
    const cart = new ShoppingCart(pricingRules);

    console.log('\n===== TEST RESULTS =====');
    console.log(`| Scenario | Expected Total | Expected Cart Items | Actual Total |`);
    const cart1 = new ShoppingCart(pricingRules);
    cart1.add(PRODUCTS['ult_small'])
    cart1.add(PRODUCTS['ult_small'])
    cart1.add(PRODUCTS['ult_small'])
    cart1.add(PRODUCTS['ult_large']);    

    console.log(`| Scenario 1 | $94.70 | ${cart1.formatItems()} | $${cart1.total()} |`);

    const cart2 = new ShoppingCart(pricingRules);
    cart2.add(PRODUCTS['ult_small'])
    cart2.add(PRODUCTS['ult_small'])
    cart2.add(PRODUCTS['ult_large'])
    cart2.add(PRODUCTS['ult_large'])
    cart2.add(PRODUCTS['ult_large'])
    cart2.add(PRODUCTS['ult_large']);
    
    console.log(`| Scenario 2 | $209.40 | ${cart2.formatItems()} | $${cart2.total()} |`);

    const cart3 = new ShoppingCart(pricingRules);
    cart3.add(PRODUCTS['ult_small'])
    cart3.add(PRODUCTS['ult_medium'])
    cart3.add(PRODUCTS['ult_medium']);
    
    console.log(`| Scenario 3 | $84.70 | ${cart3.formatItems()} | $${cart3.total()} |`);
    
    const cart4 = new ShoppingCart(pricingRules);
    cart4.add(PRODUCTS['ult_small'])
    cart4.add(PRODUCTS['1gb'], 'I<3AMAYSIM');
    
    console.log(`| Scenario 4 | $31.32 | ${cart4.formatItems()} | $${cart4.total()} |`);
}

runTests();

module.exports = {
    ShoppingCart,
    PricingRules
}

