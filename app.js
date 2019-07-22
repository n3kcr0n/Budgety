//The budgetcontroller will handle all the methods and variables that will be called later on in the controller
var budgetController = (function () {
    //function constructor for expenses and Income
    var Expense = function (id, desc, val) {

        this.id = id,
            this.desc = desc,
            this.val = val,
            this.percentage = -1;
    }
    //function constructor for expenses and Income
    var Income = function (id, desc, val) {

        this.id = id,
            this.desc = desc,
            this.val = val
    }
    //prototype of the expsense to calc the percentage
    Expense.prototype.calcPercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.floor((this.val / totalInc) * 100);
        } else {
            this.percentage = 1;
        }
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    //Data structure that holds the datas from UI
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        expPercentage: -1
    }
    // function that calculate the raw values from the data structure
    var caculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.val;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function (type, desc, val) {
            var newItem, id;
            //create new ID checking if the items is 0
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }
            //create new Item based on type
            if (type === 'exp') {
                newItem = new Expense(id, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(id, desc, val);
            }
            //push it on our data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },
        //Function that will delete the data in the data structure
        deleteItem: function (type, id) {
            var id, index;
            ids = data.allItems[type].map(function (cur) {
                return cur.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        //Function that calling tht methods that calculate the values
        calcBudget: function () {
            //calculate the total income and expenses
            caculateTotal('exp');
            caculateTotal('inc');
            //calculage the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percetage of the expenses of income
            if (data.totals.inc > 0) {
                data.expPercentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.expPercentage = -1;
            }
        },
        //Fucntion that calclate the percentages
        calcPercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },

        // return the object that holds tha data values that is calculated 
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                expPercentage: data.expPercentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();



//The UIcontroller will handle all the methods and variables that will be called later on in the controller
var UIController = (function () {
    //DOM Strings is object that will handle the class and ID of the elements
    var DOMSstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    //method for formating a number 
    var formatNum = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '- ' : '+ ') + '' + int + '.' + dec;
    };
    //NODELIST For Each Looper this is for nodelist not for array
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    //GEt data from input
    return {
        //Function that will get the values of the inputs from DOM
        getInput: function () {
            return {
                type: document.querySelector(DOMSstrings.inputType).value, //will taking +(inc) or -(exp) 
                description: document.querySelector(DOMSstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMSstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMSstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMSstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%val%', formatNum(obj.val, type));

            //insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        //Function Delete item from the UI
        deleteListItem: function (id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },
        //Function that clear Input Fields
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMSstrings.inputDescription + ',' + DOMSstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            // for (i = 0; i < fieldsArr.length; i++) {
            //     fieldsArr[i].value = '';
            // }
            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        //Display the calculated budget to the UI
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMSstrings.budgetLabel).textContent = formatNum(obj.budget, type);
            document.querySelector(DOMSstrings.budgetIncLabel).textContent = formatNum(obj.totalInc, 'inc');
            document.querySelector(DOMSstrings.budgetExpLabel).textContent = formatNum(obj.totalExp, 'exp');

            if (obj.expPercentage > 0) {
                document.querySelector(DOMSstrings.percentageLabel).textContent = obj.expPercentage + '%';
            } else {
                document.querySelector(DOMSstrings.percentageLabel).textContent = '---';
            }
        },
        //Display % 
        displayPercentages: function (perc) {
            var fields = document.querySelectorAll(DOMSstrings.expPercentage);
            nodeListForEach(fields, function (cur, index) {
                if (perc[index] > 0) {
                    cur.textContent = perc[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month, months;
            now = new Date();

            months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMSstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        //UI Enhancement
        changedType: function () {
            var fields;
            fields = document.querySelectorAll(DOMSstrings.inputType + ',' + DOMSstrings.inputDescription + ',' + DOMSstrings.inputValue);


            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMSstrings.inputBtn).classList.toggle('red');
        },

        //This is returns the DomString to be able to access by other modules
        getDOMStrings: function () {
            return DOMSstrings;
        }
    };
})();






//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    //event listeners for the initialization of the app
    var setupEventListeners = function () {
        //PAss the DOMstring here from the UI module that will be called DOM in controller module
        var Dom = UICtrl.getDOMStrings();
        //Event Handlers for Click and Enter to the keyboard or keypress
        document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            //checking if the keypress is for the enter with the keycode 13
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calcBudget();
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget in UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {
        //calc the percentage
        budgetCtrl.calcPercentages();
        //read from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //update the user interface with the new percentage
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function () {
        var input, newItem;
        //1. get the filled input data
        input = UIController.getInput();
        //Checking if the input are correct or valid
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //2. add the item to budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            //3. add the item to UI
            UICtrl.addListItem(newItem, input.type);
            //4. Clear Fields
            UICtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
            //6. update percentage
            updatePercentages();
        } else {
            alert('Empty fields or Invalid Input');
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitID, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitID = itemId.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            //1 delete item from th data structure
            budgetCtrl.deleteItem(type, id);
            //2 delete item from the UI
            UICtrl.deleteListItem(itemId);
            //3 Update and show the the new budget
            updateBudget();
            //5 Update the percentages
            updatePercentages();
        }
    }


    //this will return the method that will call the function for initialization 
    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                expPercentage: -1
            });
            console.log('Application is started');
        }
    };

})(budgetController, UIController);

controller.init();





















/* Sample of Modular Structure with the power of Closures & IIFEs
var budgetController = (function () {
    var x = 23;
    var add = function (a) {
        return x + a;
    }

    return {
        publicTest: function (b) {
            //console.log(add(b));
            return add(b);
        }
    }
})();


var UIController = (function () {

})();



var controller = (function (budgetCtrl, UICtrl) {

    var z = budgetCtrl.publicTest(5);
    return {
        anotherPub: function () {
            console.log(z);
        }
    }
})(budgetController, UIController);
*/