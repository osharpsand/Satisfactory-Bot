function CalculateCompleteManifoldData(machineName, machinePower, itemName, outputSpeed, processSpeed, maxBeltSpeed, maxPipeSpeed, solidOutput, inputItems) {
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

  inputItems.foreach(ItemData => {
    
    
    
  });
}

