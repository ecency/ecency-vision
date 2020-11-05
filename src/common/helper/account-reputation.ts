export default (input: string | number): number => {

  if(typeof input === 'string'){
    input = Number(input);
  }
  
  if (isFloat(input)) {
    return Math.floor(input);
  }
  
  if (input === 0) {
    return 25;
  }

  if (!input) {
    return input;
  }

  let neg = false;

  if (input < 0) neg = true;

  let reputationLevel = Math.log10(Math.abs(input));
  reputationLevel = Math.max(reputationLevel - 9, 0);

  if (reputationLevel < 0) reputationLevel = 0;

  if (neg) reputationLevel *= -1;

  reputationLevel = reputationLevel * 9 + 25;

  return Math.floor(reputationLevel);
};

function isFloat(n: string | number) {
  return Number(n) === n && n % 1 !== 0;
}
