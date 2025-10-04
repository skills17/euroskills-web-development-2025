const t1 = new Turbine(document.getElementById('turbine-1'));
t1.render();

const t2 = new Turbine(document.getElementById('turbine-2'), '#cdcdcd');
t2.updateTurbine(0, 50, 30);
t2.render();
