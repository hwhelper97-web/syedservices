export const whatsappLink = (message: string) => {
  const phone = "923099797771"; // replace with your number
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};