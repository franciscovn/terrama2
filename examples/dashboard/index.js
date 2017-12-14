(function(){
  'use strict';

  function createTable(data, tableTitle, nameKey, valueKey){
    var lines = "";
    for (var i = 0; i < data.length; i++){
      var index = i + 1;
      lines += "<tr><th scope=\"row\">" + index + "</th><td>"+data[i][nameKey]+"</td><td>"+data[i][valueKey]+"</td></tr>";
    }
    var table = '<div class="col-lg-4 col-md-6 col-sm-12"><br><h5 style="text-align: center;">'+tableTitle+'</h5><table id="tableEstados1d" class="table table-sm table-striped"><thead><tr><th>#</th><th>Estado</th><th>Focos</th></tr></thead><tbody>'+ lines +'</tbody></table></div>';

    var mainContent = $("#main-content");
    mainContent.append(table);
  }

  function createChart(data, chartId, chartTitle, labelKey, valueKey, type){

    var chartDiv = '<div class="col-lg-4 col-md-6 col-sm-12"><br><h5 style="text-align: center;">'+chartTitle+'</h5><canvas id="'+chartId+'" width="488" height="587"></canvas></div>';
    var mainContent = $("#main-content");
    mainContent.append(chartDiv);

    var chartElement = document.getElementById(chartId).getContext('2d');

    var labels = data.map(function(dataElem){
      return dataElem[labelKey];
    });
    var values = data.map(function(dataElem){
      return dataElem[valueKey];
    });

    var options = {};

    if (type == "bar" || type =="horizontalBar"){
      options = {
        legend: {display: false},
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      };
    }
    var char = new Chart(chartElement, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: "Focos",
          backgroundColor: 'rgb(247, 195, 121)',
          data: values
        }]
      },
      options: options
    });
  }

  function createMap(mapTitle, imageUrl){

    var imageDiv = '<div class="col-lg-4 col-md-6 col-sm-12"><br><h5 style="text-align: center;">'+mapTitle+'</h5><img style="width:100%" src="'+imageUrl+'"></div>';
    var mainContent = $("#main-content");
    mainContent.append(imageDiv);

  }

  /**
   * Normalize data to create chart and table
   * @param {JSON} data - Data to be normalized
   * @param {Array} fieldsToNormalize - Arrays field to normalize
   * @return {JSON} [{name: String, quantidade: Number}]
   */
  function normalizeData(data, fieldsToNormalize){
    var dataNormalized = [];
    if (data && data.features && Array.isArray(data.features)){
      data.features.forEach(function(feature){
        var featureNormalized = {};
        fieldsToNormalize.forEach(function(field){
          if (feature.properties.hasOwnProperty(field)){
            featureNormalized[field] = feature.properties[field];
          }
        });
        if (feature.properties.ocorrencia != null)
          dataNormalized.push(featureNormalized);
      });
      return dataNormalized;
    } else {
      return dataNormalized;
    }
  }

  $(document).ready(function() {

    var fields = ["monitored_nome", "ocorrencia"];

    var urlEstados3d = "https://private-b1c17-terrama2monitor.apiary-mock.com/focosEstados3d";
    $.get(urlEstados3d, function(data, status){
      if (status == "success"){
        var normalizedData = normalizeData(data, fields);
        createTable(normalizedData, "Contagem de focos", fields[0], fields[1]);
        createChart(normalizedData, "chart1", "Contagem de focos", fields[0], fields[1], "horizontalBar");
        var imageUrl = "http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=terrama2q:marble_pyramid,terrama2_4:view4,terrama2_1:view1&time=2017-12-13T02:00:00.000Z/2017-12-14T12:49:10.310Z&styles=&bbox=-86,-56,-29,12&width=489&height=587&srs=EPSG:4326&format=image%2Fpng";
        createMap("Focos 48h", imageUrl);
        createChart(normalizedData, "chart2", "Contagem de focos", fields[0], fields[1], "bar");
      }
    });
  });

  setTimeout(function(){
    window.location.reload(1);
 }, 1800000);

}());