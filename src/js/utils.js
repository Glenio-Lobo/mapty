export const dataFormater = date => {
  const options = { month: 'long', day: 'numeric' };
  // @ts-ignore
  return new Intl.DateTimeFormat('en', options).format(date);
}
                      