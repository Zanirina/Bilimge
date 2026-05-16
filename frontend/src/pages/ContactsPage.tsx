import { FaHome, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        
        {/* Left Side - Contact Info */}
        <div className="space-y-8">
          <div>
            <p className="text-[#3356AA] font-medium">Contact Us</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">
              Get In Touch With Us
            </h1>
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              Have questions about universities, admissions, or using the platform? 
              We’re here to help you every step of the way. Whether you’re choosing a 
              major or preparing for exams, our team is ready to support your journey.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            {/* Location */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#3356AA]/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-[#3356AA]">
                <FaHome size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Our Location</p>
                <p className="text-gray-600 mt-1">
                  Astana, Mangilik El, 55/1, Block C1
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#3356AA]/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-[#3356AA]">
                <FaPhone size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone Number</p>
                <p className="text-gray-600 mt-1">+7 777 777 77 77</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#3356AA]/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-[#3356AA]">
                <FaEnvelope size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email Address</p>
                <p className="text-gray-600 mt-1">bilimge@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="bg-white shadow-xl rounded-3xl p-8 md:p-10 border border-gray-100">
          <form className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#3356AA] transition-colors"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#3356AA] transition-colors"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Your Phone"
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#3356AA] transition-colors"
              />
            </div>

            <div>
              <textarea
                placeholder="Your Message"
                rows={5}
                className="w-full px-5 py-4 border border-gray-200 rounded-3xl focus:outline-none focus:border-[#3356AA] transition-colors resize-y"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#3356AA] hover:bg-[#2a4a8f] text-white font-semibold py-4 rounded-2xl transition-all duration-200 active:scale-95"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}