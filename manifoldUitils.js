exports.CalculateCompleteManifoldData = function (
  machineName,
  machinePower,
  itemName,
  outputSpeed,
  processSpeed,
  maxBeltSpeed,
  maxPipeSpeed,
  solidOutput,
  inputItems
) {
  // Initialize the message string
  let message = `Complete Breakdown:\n`;

  // **Machines Calculation**
  const machinesNeeded = Math.floor(outputSpeed / processSpeed);
  const remainderOfItemsToMachine = outputSpeed % processSpeed;
  const percentLeftOfMachine = (remainderOfItemsToMachine / processSpeed) * 100;

  // Power estimation
  const machinePowerEstimate = (outputSpeed / processSpeed) * machinePower;

  // Formatting machine name for pluralization
  let multipleOf = machinesNeeded !== 1 ? `s` : ``;
  let formattedMachineName = machineName.replace(/y$/, `ie`) + multipleOf;

  // Adding machines information to the message
  message += `You need ${machinesNeeded} ${formattedMachineName} running at 100%`;
  if (percentLeftOfMachine !== 0) {
    message += ` and 1 ${machineName} running at ${percentLeftOfMachine.toFixed(2)}%`;
  }

  // **Output Carrier Calculation**
  let maxCarrierSpeed = solidOutput ? maxBeltSpeed : maxPipeSpeed;
  let outputType = solidOutput ? `belt` : `pipe`;

  const outputCarriersNeeded = Math.floor(outputSpeed / maxCarrierSpeed);
  const remainderOfItemsLeft = outputSpeed % maxCarrierSpeed;

  multipleOf = outputCarriersNeeded !== 1 ? `s` : ``;
  message += `.\nYou need ${outputCarriersNeeded} full ${outputType}${multipleOf} at ${maxCarrierSpeed} items/min`;

  if (remainderOfItemsLeft !== 0) {
    message += ` and 1 ${outputType} handling ${remainderOfItemsLeft} items/min`;
  }

  // **Inputs Calculation**
  message += `\n\nIndividual input items breakdown:`;

  inputItems.forEach((itemData) => {
    // If itemData.isSolid is null or undefined, assume the item is solid (use belt)
    const isSolid = itemData.isSolid !== null && itemData.isSolid !== undefined ? itemData.isSolid : true;

    // Calculate input requirements for each item
    const amountNeeded = (outputSpeed / processSpeed) * itemData.usageSpeed;
    const carrierSpeed = isSolid ? maxBeltSpeed : maxPipeSpeed;
    const carrierName = isSolid ? `belt` : `pipe`;

    const fullInputsNeeded = Math.floor(amountNeeded / carrierSpeed);
    const remainderInputsNeeded = amountNeeded % carrierSpeed;
    const machinesPerInput = fullInputsNeeded < 1 
      ? remainderInputsNeeded / itemData.usageSpeed
      : carrierSpeed / itemData.usageSpeed;

    // Add input item breakdown to the message
    let pluralizedCarrierName = fullInputsNeeded !== 1 ? `${carrierName}s` : carrierName;
    message += `\n${itemData.itemName}:\n  - Required: ${amountNeeded.toFixed(2)}/min`;
    message += `\n  - Carriers: ${fullInputsNeeded} full ${pluralizedCarrierName}`;
    if (remainderInputsNeeded !== 0) {
      message += ` and 1 ${carrierName} carrying ${remainderInputsNeeded.toFixed(2)} items/min`;
    }
    message += `.\n  - Longest manifold connects to ${machinesPerInput.toFixed(2)} ${formattedMachineName}`;
  });

  // Return the formatted message
  return message;
};


