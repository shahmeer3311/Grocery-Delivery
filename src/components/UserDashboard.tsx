import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDB from '@/lib/db'
import Grocery from '@/models/grocery.model'
import GroceryItemCard from './GroceryItemCard'

const UserDashboard = async ({ groceryList }: { groceryList: any[] }) => {
  await connectDB();
  const groceries = await Grocery.find({});
  const plainGroceries = JSON.parse(JSON.stringify(groceries));
  return (
    <div>
      <HeroSection />
      <CategorySlider />
      <div className="max-w-[80%] md:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-700 text-center mt-8">Popular Groceries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groceryList.map((grocery: any) => (
            <GroceryItemCard key={grocery._id} grocery={grocery} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
