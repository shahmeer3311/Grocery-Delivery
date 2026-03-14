import { auth } from "@/auth";
import connectDB from "@/lib/db"
import UserModel from "@/models/user.model";
import { redirect } from "next/navigation";
import EditUser from "@/components/EditUser";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import GeoUpdater from "@/components/GeoUpdater";
import Grocery from "@/models/grocery.model";

const Home = async(props: {
  searchParams?: Promise<{q: string}> 
}) => {
  const searchQuery = (await props.searchParams)?.q || "";
  console.log("[PAGE.TSX] ========== HOME PAGE RENDERING ==========");
  await connectDB();
  const session=await auth();
  console.log("[PAGE.TSX] Session:", JSON.stringify(session?.user, null, 2));
  
  const user=await UserModel.findById(session?.user?.id);
  console.log("[PAGE.TSX] User from DB:", user ? { id: user._id, role: user.role, name: user.name } : "NOT FOUND");

   if(!user){
    console.log("[PAGE.TSX] No user found, redirecting to login");
    redirect("/login");
   }

   const inCompleteProfile = !user.mobile || !user.role || (!user.mobile && user.role==="user");
 
    if(inCompleteProfile){  
      return <EditUser />
    }

    const plainUser=JSON.parse(JSON.stringify(user));

    // If DB record doesn't have an image but the auth session has one, use it as a fallback
    if (!plainUser.images && session?.user?.image) {
      plainUser.images = session.user.image as string;
    }

  console.log("[PAGE.TSX] About to render - user.role =", user.role);

   let groceryList: any[] = [];
   if(user.role==="user"){
    if(searchQuery){
        groceryList=await Grocery.find({
          $or: [
            { name: { $regex: searchQuery || "", $options: "i" } },
            { category: { $regex: searchQuery || "", $options: "i" } },
          ]
        })
    }else{
        groceryList=await Grocery.find({});
    }
   }

  
  return (
    <div>
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id.toString()} />
      {user.role === "user" ? (
        <UserDashboard groceryList={groceryList} />
      ) : user.role === "admin" ? (
        <AdminDashboard />
      ) : user.role === "deliveryBoy" ? (
        <>
          {console.log("[PAGE.TSX] Rendering DeliveryBoy component")}
          <DeliveryBoy />
        </>
      ) : (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Unknown Role</h1>
            <p className="mt-2 text-gray-500">Your role: {user.role || "none"}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home