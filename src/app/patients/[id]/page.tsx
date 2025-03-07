<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="bg-blue-50 rounded-lg p-6 flex items-center shadow-sm">
    <Pill className="h-10 w-10 text-blue-500 mr-4" />
    <div>
      <div className="text-base text-gray-700">Medications</div>
      <div className="text-3xl font-bold text-gray-800">{summary.medicationCount}</div>
    </div>
  </div>
  
  <div className="bg-green-50 rounded-lg p-6 flex items-center shadow-sm">
    <Heart className="h-10 w-10 text-green-500 mr-4" />
    <div>
      <div className="text-base text-gray-700">Conditions</div>
      <div className="text-3xl font-bold text-gray-800">{summary.conditionCount}</div>
    </div>
  </div>
  
  <div className="bg-purple-50 rounded-lg p-6 flex items-center shadow-sm">
    <Clock className="h-10 w-10 text-purple-500 mr-4" />
    <div>
      <div className="text-base text-gray-700">Encounters</div>
      <div className="text-3xl font-bold text-gray-800">{summary.encounterCount}</div>
    </div>
  </div>
</div> 