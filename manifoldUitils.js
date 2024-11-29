exports.CalculateCompleteManifoldData = function(machineName, machinePower, itemName, outputSpeed, processSpeed, maxBeltSpeed, maxPipeSpeed, solidOutput, inputItems) {
  // machines/ inputs outputs/ message

  //Message
  let message = `Complete Breakdown:\n`;
  
  //Machines
  const machinesNeeded = Math.floor(outputSpeed / processSpeed);
  const remainderOfItemsToMachine = outputSpeed % processSpeed;
  const percentLeftOfMachine = remainderOfItemsToMachine / processSpeed * 100;
  const machinePowerEstimate = outputSpeed / processSpeed * machinePower;

  let multipleOf = ``;
  let formattedMachineName = machineName;
  if ( machinesNeeded != 1 ) {
    multipleOf = `s`;
    formattedMachineName = machineName.replace(/y$/, `ies`);
  }

  
  message += `You need ${machinesNeeded} ${formattedMachineName}${multipleOf} running at 100%`;
  if ( percentLeftOfMachine != 0 ) {
    message += ` and 1 ${machineName} running at ${percentLeftOfMachine}%`;
  }

  //Outputs
  let maxCarrierSpeed = maxBeltSpeed;
  let outputType = `belt`;
  if ( !solidOutput ) {
    maxCarrierSpeed = maxPipeSpeed; 
    outputType = `pipe`;
  )
    
  const outputCarriersNeeded = Math.floor(outputSpeed / maxCarrierSpeed);
  const remainderOfItemsLeft = outputSpeed % maxCarrierSpeed;

  multipleOf = ``;
  if ( outputBeltsNeeded != ) { multipleOf = `s`; }

  message += `.\nYou need ${outputCarriersNeeded} full ${outputType}${multipleOf} of ${maxCarrierSpeed} outputting ${carrierSpeed * outputCarriersNeeded} items/min`;

  if ( remainderOfItemsLeft != 0 ) {
    message += ` and 1 ${outputType} outputting ${remainderOfItemsLeft} items/min`;
  }
  
  //Inputs
  message += `\n\nIndividual input items breakdown:`;
  
  inputItems.foreach(itemData => {

    let amountNeeded = outputSpeed / processSpeed * itemData.usageSpeed;
    let isSolid = itemData.isSolid;
    let carrierSpeed = maxBeltSpeed; 
    let carrierName = `belt`;
    if ( !isSolid ) { carrierSpeed = maxPipeSpeed; carrierName = `pipe`; }
    let fullInputsNeeded = Math.floor( amountNeeded / carrierSpeed );
    if ( fullInputsNeeded != 0 ) { carrierName += `s`; }
    let remainderInputsNeeded = amountNeeded % carrierSpeed;
    let machinesPerInput = 0;

    for(let machineIndex = 0; )
    
    message += `\n${itemData.itemName}:\n  You need ${amountNeeded}/min.\n  You need ${fullInputsNeeded} full ${carrierName}`;
    if ( remainderInputsNeeded != 0 ) { message += `and 1 ${carrierName} inputting ${remainderItemsNeeded}`; }
    message += `.\n You should expect the longest manifold to saturate in ${0} minutes`;
  });
}

