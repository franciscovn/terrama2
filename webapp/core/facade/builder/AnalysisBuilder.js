var Utils = require("./../../Utils");
var DataSeriesBuilder = require("./DataSeriesBuilder");
var Model = require("./../../data-model/Analysis");
var ScheduleModel = require("./../../data-model/Schedule");
var AnalysisDataSeriesModel = require("./../../data-model/AnalysisDataSeries");

/**
 * It simulates a Analysis creation. It is used to build an analysis in order to validate it before save in database
 * 
 * @param {Object} analysisObject - TerraMA² analysis values
 * @param {Object} analysisObject.metadata - TerraMA² Analysis Metadata (Dcp only)
 * @param {Object} storager - TerraMA² storager values
 * @param {number|Object} scriptLanguage - TerraMA² script values
 * @param {Object} extra - Extra analysis values
 * @param {Object} extra.historical - TerraMA² reprocessing historical data values  
 * @return {Analysis}
 */
function AnalysisBuilder(analysisObject, storager, scriptLanguage, extra) {
  if (!extra) {
    extra = {};
  }

  var rawDataSeries = {
    name: analysisObject.name,
    description: "Generated by analysis " + analysisObject.name,
    data_provider_id: analysisObject.data_provider_id,
    data_series_semantics_id: storager.semantics.format.id,
    data_series_semantics: storager.semantics,
    dataSets: [
      {
        active: true,
        format: storager.format
      }
    ]
  };

  var dataSeriesModel = DataSeriesBuilder(rawDataSeries);

  analysisObject.dataset_output = dataSeriesModel.dataSets[0].id;
  analysisObject.schedule.id = dataSeriesModel.id;
  analysisObject.schedule = new ScheduleModel(analysisObject.schedule);
  analysisObject.id = dataSeriesModel.id;

  if (analysisObject.grid) {
    analysisObject.grid.id = analysisObject.id;
    analysisObject.grid.analysis_id = analysisObject.id;
  }
  analysisObject.outputGrid = analysisObject.grid;

  // setting historical data
  analysisObject.historicalData = extra.historical;

  // checking script language type
  if (Utils.isNumber(scriptLanguage)) {
    analysisObject.script_language = {id: scriptLanguage};
  } else if (Utils.isObject(scriptLanguage)) {
    analysisObject.script_language = scriptLanguage;
  } 
  
  var analysisModel = new Model(analysisObject);
  analysisModel.setDataSeries(dataSeriesModel);

  analysisObject.analysisDataSeries.forEach(function(analysisDS, index) {
    analysisDS.id = analysisObject.id + index;
    analysisModel.addAnalysisDataSeries(analysisDS);
  });

  // checking analysis metadata
  if (!Utils.isEmpty(analysisObject.metadata)) {
    analysisModel.setMetadata(Utils.formatMetadataFromDB(analysisObject.metadata));
  }

  return analysisModel;
}


module.exports = AnalysisBuilder;