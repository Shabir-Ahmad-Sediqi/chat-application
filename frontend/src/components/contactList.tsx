import { useEffect } from "react"
import { useMessageStore } from "../store/useMessageStore"
import UsersLoadingSkeleton from "./usersLoadingSkelaton";
import NoChatsFound from "./noChatsFound";


function ContactList() {
  const {getAllContacts, allContacts, isUsersLoading, setSelectedUser} = useMessageStore()
  
  useEffect(() => {
    getAllContacts()
  }, [getAllContacts]);
  console.log(allContacts)
  if (isUsersLoading) return <UsersLoadingSkeleton/>
  if (allContacts.length === 0) return <NoChatsFound/>
  return (
    <>
      {allContacts.map((contact) => (
        <div 
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover: bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
          >
          <div className="flex items-center gap-3">
            <div className={`avatar online`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
          </div>

        </div>
      ))}
    </>
  )
}

export default ContactList