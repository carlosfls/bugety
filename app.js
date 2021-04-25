//budget controller
var budgetController = (function () {
    //creamos una funcion constructor para los gastos y las entradas
    var Expenses = function (id, descrption, value) {
        this.id = id;
        this.descrption = descrption;
        this.value = value;
        this.porciento = -1;
    };

    Expenses.prototype.calcPorciento = function(totalIncome){
        if(totalIncome>0){
            this.porciento = Math.round((this.value / totalIncome) * 100);
        }else{
            this.porciento = -1;
        }
    };

    Expenses.prototype.getPorciento = function(){
        return this.porciento;
    };

    var Incomes = function (id, descrption, value) {
        this.id = id;
        this.descrption = descrption;
        this.value = value;
    };

    var calcularTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (element) {
            sum += element.value;
        });
        data.totals[type] = sum;
    };

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
        porciento: -1
    };

    return {
        //creando una funcion que añada un objeto
        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                //creando un nuevo id a partir del ultimo id del array seleccionado
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                //sino el id igual a 0 pues el array estará vacio
                ID = 0;
            }
            //creando un nuevo objeto basandose si es un gasto o entrada
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Incomes(ID, des, val);
            }
            ///guardandolo en el array 
            data.allItems[type].push(newItem);
            //retornado el objeto guardado
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            //map es como un foreach lo que devuelve un nuevo array
            //con los valores que valla iterando
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            //capturo el indice del id del objeto que quiero eliminar
            index = ids.indexOf(id);

            if (index !== -1) {
                //splice borra objetos de un array
                //spice(pos donde empezar a borrar,numero de elemento a borrar)
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            //calcular total de entradas y gastos
            calcularTotal('inc');
            calcularTotal('exp');
            //calcular el presupuesto: entradas - gastos
            data.budget = data.totals.inc - data.totals.exp;
            //calcular el porcentaje de las entradas
            if (data.totals.inc > 0) {
                data.porciento = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.porciento = -1;
            }
        },

        calculatePercentage:function(){

            data.allItems.exp.forEach(function(element){
                element.calcPorciento(data.totals.inc);
            });

        },

        getPorcientos: function(){
            var allPorc=data.allItems.exp.map(function(element){
                return element.getPorciento();
            });
            return allPorc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                porc: data.porciento
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();

//user interface controller
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        budgetPercLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var nodeForEach = function(list,fun){
        for (let i = 0; i < list.length; i++) {
            fun(list[i],i);                    
        }
    };

    var formatNumber= function(num,type){
        var numSplit,int,dec;

        num = Math.abs(num);
        //lo deja en dos decimales toFixed(cantDecimales)
        num = num.toFixed(2);
        numSplit = num.split('.');
        //cojo la parte decimal y la entera
        int = numSplit[0];
        //veo si tiene 3 cifras
        if(int.length>3){
            int = int.substr(0,int.length -3) + ',' + int.substr(int.length -3,int.length);
            //ej 23510 -> 23,510.00
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 

    };

    return {

        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, element, newHtml;
            //1-creo un string html con valores predefinidos
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%">
             <div class="item__description">%description%</div><div class="right clearfix">
             <div class="item__value">%value%</div><div class="item__delete">
             <button class="item__delete--btn"><i class="ion-ios-close-outline">borrar
             </i></button></div></div></div>`;
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div>
                <div class="item__percentage">21%</div><div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline">borrar
                </i></button></div></div></div>`;
            }
            //2-reemplazar los textos predefinidos con los datos del objeto
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.descrption);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            //metodo de los string busca dentro del string la cadena que coincida con %id%
            //y la reeempleza por el valor elegido

            //3-insertar el html en la pagina
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            //insertAdjacentHtml(pos,elemento) inserta un codigo html en una posicion

        },

        deleteListItem: function(elementId){

            var element = document.getElementById(elementId);
            //para eliminar el elemento me muevo hasta el padre
            //y desde ahi lo elimino
            element.parentNode.removeChild(element);
            
        },

        clearFields: function () {
            var fields, fieldsArr;
            //seleccionado ambos campos de la pagina
            fields = document.querySelectorAll(DOMstrings.inputDescription
                + ', ' + DOMstrings.inputValue);
            //convirtiendo la lista retornada en un array
            fieldsArr = Array.prototype.slice.call(fields);
            //recorriendo sobre el array y limpiando los campos
            fieldsArr.forEach(element => {
                element.value = "";
            });
            //recobrando el foco del campo descrpcion
            fieldsArr[0].focus();

        },

        updateBudgetUI: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.budgetExpLabel).textContent = formatNumber(obj.totalExp,'exp');
            if (obj.porc > 0) {
                document.querySelector(DOMstrings.budgetPercLabel)
                    .textContent = obj.porc + '%';
            } else {
                document.querySelector(DOMstrings.budgetPercLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expPercLabel);

            nodeForEach(fields,function(element,index){
                if(percentages[index]>0){
                    element.textContent = percentages[index] + '%'
                }else{
                    element.textContent = '---'
                }
            });

        },

        displayDate: function(){
            var now,meses,mes,año;
            now=new Date();
            meses=['ene','feb','marz','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            mes = now.getMonth();
            año = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = meses[mes] + ' ' + año;
        },

        changeType:function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeForEach(fields,function(element){
                element.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

//global app controller
var controller = (function (budgetCtrl, UICtrl) {
    var setUpEventListeners = function () {
        //pasando datos de la vista al controlador
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType)
        .addEventListener('change',UICtrl.changeType);
    };
    var updateBudget = function () {

        //calcular el budget
        budgetCtrl.calculateBudget();
        //retornar el budget
        var budget = budgetCtrl.getBudget();
        //mostrar el budget en la vista
        UICtrl.updateBudgetUI(budget);

    };

    var updatePercentages = function(){

        //calcular los porcentajes
        budgetCtrl.calculatePercentage();
        //obtenerlos del budget controller
        var procientos= budgetCtrl.getPorcientos();
        //actualizarlos en la interface
        UICtrl.displayPercentages(procientos);

    };

    var ctrlAddItem = function () {
        var input, newItem;
        //get de input data
        input = UICtrl.getInput();
        //validando entradas isNaN(valor) identifica si el valor pasado no es un numero
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
            //añadiendo un nuevo item
            newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
            //añadiendolo a la interface de usuario
            UICtrl.addListItem(newItem, input.type);
            //limpiando los campos
            UICtrl.clearFields();
            //actualizando el budget
            updateBudget();
            //actualizando los procentajes
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;
        //event.target me da el nodo donde fu ejecutado el evento
        //con parentNode vamos subiendo de nodos hasta llegar al contenedor        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //si hay un valor
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            //borrar del listado
            budgetCtrl.deleteItem(type, ID);
            //borrar de la interface
            UICtrl.deleteListItem(itemId);
            //recalcular el budget
            updateBudget();
            //actualizando los porcentjes
            updatePercentages();
        }
    };

    return {
        //creando mi funcion de inicialización
        init: function () {
            console.log('Aplicación iniciada');
            UICtrl.displayDate();
            UICtrl.updateBudgetUI({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                porc: -1
            });
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();