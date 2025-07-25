import { useRemote } from "@/store/remote";
import { Icon } from "@iconify/react/dist/iconify.js";

export function Socials(props: { axis: "y" | "x" }) {
  const remote = useRemote();
  return (
    <>
      <ul
        className={`flex items-center justify-center size-max relative ${
          props.axis === "y" ? "flex-col gap-2" : "flex-row gap-4"
        }`}
      >
        {remote.social?.map((social) => (
          <li key={social.id}>
            <a
              draggable="false"
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white ease-gentle duration-200 size-6"
            >
              <Icon icon={social.icon} className="size-6" />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
