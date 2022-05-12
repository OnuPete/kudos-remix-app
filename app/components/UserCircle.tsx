import { Profile } from "@prisma/client";

interface Props {
  profile: Profile
  className?: string
  onClick?: (...args: any) => any
}
export const UserCircle = ({ profile, onClick, className}: Props) => {
  return (
    <div
      className={`${className} cursor-pointer bg-gray-400 rounded-full flex justify-center items-center`}
      onClick={onClick}
      style={{
        backgroundSize: "cover",
        ...(profile.profilePicture ? { backgroundImage: `url(${profile.profilePicture})` } : {}),
    }}
      >
        {
           !profile.profilePicture && (
              <h2>{profile.firstName.charAt(0).toUpperCase()}{profile.lastName.charAt(0).toUpperCase()}</h2>
           )
        }
      </div>
  )
};
