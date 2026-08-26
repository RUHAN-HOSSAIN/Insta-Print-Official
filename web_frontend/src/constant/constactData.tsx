import { LocationIcon, CallIcon, WhatsappIcon } from "../assets/icons/Icons";

export type ContactItem = {
  id: number;
  title: string;
  description: React.ReactNode;
  icon: React.ElementType;
  iconClassName: string;
  phone?: React.ReactNode;
};

export const contactData: ContactItem[] = [
  {
    id: 1,
    title: "Our Location",
    description: (
      <>
        Room 204, New Male Hall-2
        <br />
        RUET Campus
        <br />
        Rajshahi-6204, Bangladesh
      </>
    ),
    icon: LocationIcon,
    iconClassName: "text-blue-500",
  },
  {
    id: 2,
    title: "Whatsapp Support",
    description: (
      <>
        Available Sat - Fri <br />
        except during class hours
      </>
    ),
    icon: WhatsappIcon,
    iconClassName: "text-green-500",
    phone: (
      <a
        href="https://wa.me/8801932066557?text=Hello%20Insta%20Print%2C%20I%20need%20help."
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 hover:underline italic"
      >
        +88 01932-066557
      </a>
    ),
  },
  {
    id: 3,
    title: "Phone Support",
    description: <>Available Sat-Fri, 9 pm - 12 am</>,
    icon: CallIcon,
    iconClassName: "text-blue-500",
    phone: (
      <a
        href="tel:+8801572902567"
        className="hover:underline italic"
      >
        +88 01572-902567
      </a>
    ),
  },
];
