function CalculateCompleteManifoldData(machineName, machinePower, itemName, outputSpeed, processSpeed, maxBeltSpeed, inputItems, inputItemsSpeed) {
  // machines/ injectors outputs/

  //Machines
  const machinesNeeded = Math.floor(outputSpeed / processSpeed);
  const remainderOfItemsToMachine = outputSpeed % processSpeed;
  const percentLeftOfmachine = remainderOfItemsToMachine / processSpeed * 100;
  const machinePowerEstimate = outputSpeed / processSpeed * machinePower;

  //Outputs
  const outputBeltsNeeded = Math.floor(outputSpeed / maxBeltSpeed);
  const remainderOfItemsLeft = 0;
  
}
