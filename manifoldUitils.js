function CalculateCompleteManifoldData(machineName, machinePower, itemName, outputSpeed, processSpeed, maxBeltSpeed, inputItems) {
  // machines/ inputs outputs/ message

  //Message
  let message = `Complete Breakdown:\n`;
  
  //Machines
  const machinesNeeded = Math.floor(outputSpeed / processSpeed);
  const remainderOfItemsToMachine = outputSpeed % processSpeed;
  const percentLeftOfMachine = remainderOfItemsToMachine / processSpeed * 100;
  const machinePowerEstimate = outputSpeed / processSpeed * machinePower;

  if ( percentLeftOfMachine === 0 ) {
    message += `You need ${machinesNeeded} ${machineName}(s)\n`;
  } else {
    message += `You need ${machinesNeeded}  ${machineName}(s) and 1 ${machineName} running at ${percentLeftOfMachine}%\n`;
  }

  //Outputs
  const outputBeltsNeeded = Math.floor(outputSpeed / maxBeltSpeed);
  const remainderOfItemsLeft = outputSpeed % maxBeltSpeed;

  if ( remainderOfItemsLeft === 0 ) {
    
  }
  
  //Inputs

  inputItems.foreach(ItemData => {
    
    
    
  })
}
