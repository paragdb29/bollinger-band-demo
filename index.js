import boll from 'bollinger-bands';

function getData(url,callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
        if( xhr.status == 200 ) {
            callback(xhr.responseText);
        } else {
            callback(null);
        }
    };
    xhr.send();
}

function getGraphdata(data,bollData){
    var dataToPlot = [];
    data.forEach(function(item, index, array) {
        var temp = [];
        var date = new Date(item.date);
        temp[0] = date.getTime();
        temp[1] = item.last;
        temp[2] = bollData.upper[index]?bollData.upper[index]:null;
        temp[3] = bollData.lower[index]?bollData.lower[index]:null;
        temp[4] = bollData.mid[index]?bollData.mid[index]:null;
        dataToPlot.push(temp);
    });
    return dataToPlot;
}

function renderChart(data, container, id, company){
    Highcharts.stockChart(container, {

        rangeSelector: {
            selected: 2
        },

        title: {
            text: company
        },

        legend: {
            enabled: true
        },

        plotOptions: {
            series: {
                showInLegend: true
            }
        },

        series: [{
            type: 'line',
            id: id,
            name: company,
            data: data
        }, {
            type: 'bb',
            linkedTo: id
        }]
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    var stl = [];
    var abb = [];
    getData("data/Oslo_STL.json", function(dataSet) {
        var dataStl = JSON.parse(dataSet);
        if(dataStl) {
            dataStl.forEach(function(item, index, array) {
                stl.push(item.last); 
              });
              stl = boll(stl,20,2);
              var graphData = getGraphdata(dataStl, stl);
              renderChart(graphData, "osloSTL", "osloSTL", "Oslo STL");
        }
    });
    getData("data/Stockholm_ABB.json", function(dataSet) {
        var dataAbb = JSON.parse(dataSet);
        if( dataAbb ) {
            dataAbb.forEach(function(item, index, array) {
                abb.push(item.last); 
              });
              abb = boll(abb,20,2);
              var graphData = getGraphdata(dataAbb, abb);
              renderChart(graphData, "stockholmABB", "stockholmABB", "Stockholm ABB");
        }
    });
});