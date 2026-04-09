import { useState, FormEvent, ChangeEvent } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const Contact = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Final Phone Validation on Submit
    const digits = formState.phone.replace(/\D/g, '');
    if (digits.length > 0 && digits.length !== 10) {
       e.preventDefault(); // Stop submission
       setPhoneError("Please enter 10 digits only");
       return;
    }

    // Block submission if there is a phone error
    if (phoneError) {
      e.preventDefault(); // Stop submission
      return; 
    }

    // UI Feedback: We briefly show loading state, but since the form opens in a new tab,
    // we cannot know when it completes. We reset the state after a short delay.
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // 1. Validation: Check if letters (text) are entered
    if (/[a-zA-Z]/.test(val)) {
      setPhoneError("Please only enter numbers");
      setFormState(prev => ({ ...prev, phone: val }));
      return;
    }

    const digits = val.replace(/\D/g, '');

    // 2. Validation: Check if more than 10 digits
    if (digits.length > 10) {
      setPhoneError("Please enter 10 digits only");
      setFormState(prev => ({ ...prev, phone: val }));
      return;
    }

    // Clear error if input is seemingly valid during typing
    setPhoneError(null);

    // 3. Formatting
    // Automatically format when we hit exactly 10 digits
    if (digits.length === 10) {
      const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      setFormState(prev => ({ ...prev, phone: formatted }));
    } else {
      // Allow user to type/delete freely if not 10 digits
      setFormState(prev => ({ ...prev, phone: val }));
    }
  };

  const handlePhoneBlur = () => {
    const digits = formState.phone.replace(/\D/g, '');
    // If user typed something but it's not 10 digits (e.g. they typed 9 and left)
    if (digits.length > 0 && digits.length !== 10) {
        setPhoneError("Please only enter 10 digits");
    }
  };

  const handlePhoneClick = () => {
    // If there is an invalid text error, clear the field on click to allow retyping
    if (phoneError) {
      setFormState(prev => ({ ...prev, phone: '' }));
      setPhoneError(null);
    }
  };

  return (
    <div className="w-full pt-24 pb-24">
      <SEO 
        title="Contact Us"
        description="Contact Ameristar School in Los Angeles for CA Real Estate and Insurance licensing inquiries."
        keywords="contact Ameristar School, real estate school Los Angeles, insurance school Los Angeles"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <p className="text-champagne uppercase tracking-widest text-sm font-semibold mb-4">Get in Touch</p>
              <h1 className="font-serif text-5xl text-obsidian mb-6">Start the Conversation</h1>
              <p className="text-gray-500 font-light text-lg leading-relaxed">
                Whether you are ready to enroll or simply have questions about the licensure process, we are here to provide clarity.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-champagne/10 transition-colors">
                  <Mail className="w-6 h-6 text-obsidian" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">Email</h3>
                  <a href="mailto:ameristarschool@yahoo.com" className="text-gray-500 font-light hover:text-champagne transition-colors">
                    ameristarschool@yahoo.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-champagne/10 transition-colors">
                  <Phone className="w-6 h-6 text-obsidian" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">Phone</h3>
                  <a href="tel:3103770337" className="block text-gray-500 font-light hover:text-champagne transition-colors">
                    (310) 377-0337
                  </a>
                  <a href="tel:6263080150" className="block text-gray-500 font-light hover:text-champagne transition-colors">
                    (626) 308-0150
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-champagne/10 transition-colors">
                  <MapPin className="w-6 h-6 text-obsidian" strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-lg mb-1">Locations</h3>
                  <div>
                    <p className="text-xs text-champagne uppercase tracking-widest font-semibold mb-1">San Gabriel · Los Angeles</p>
                    <p className="text-gray-500 font-light">
                      120 S. Del Mar Ave, Unit 1143<br />
                      San Gabriel, CA 91778<br />
                      <span className="text-xs">Available by appointment.</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-champagne uppercase tracking-widest font-semibold mb-1">Irvine · Orange County <span className="text-gray-400 normal-case tracking-normal font-light">(Coming Soon)</span></p>
                    <p className="text-gray-500 font-light">
                      Address to be announced.<br />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-gray-50 p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <form 
              action="https://formbold.com/s/3VKkA"
              method="POST"
              onSubmit={handleSubmit}
              target="_blank"
              className="space-y-8"
            >
              {/* Spam Protection Honeypot */}
              <input type="text" name="_gotcha" style={{display: "none"}} />

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-lg focus:outline-hidden focus:border-champagne transition-colors placeholder-gray-300"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-lg focus:outline-hidden focus:border-champagne transition-colors placeholder-gray-300"
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formState.phone}
                  onChange={handlePhoneChange}
                  onClick={handlePhoneClick}
                  onBlur={handlePhoneBlur}
                  className={`w-full bg-transparent border-b py-3 text-lg focus:outline-hidden transition-colors placeholder-gray-300 ${
                    phoneError 
                      ? 'border-red-500 text-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-champagne'
                  }`}
                  placeholder="(888) 888-8888"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-2 animate-fade-in font-medium">
                    {phoneError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
                <textarea 
                  name="message"
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-lg focus:outline-hidden focus:border-champagne transition-colors placeholder-gray-300 resize-none"
                  placeholder="How can we help you succeed?"
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting || !!phoneError}
                  className="w-full flex justify-center items-center gap-2 bg-champagne text-white py-4 rounded-xl hover:bg-[#b8962e] transition-all uppercase text-sm tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>Sending... <Loader2 className="animate-spin" size={16} /></>
                  ) : (
                    <>Send Message <Send size={16} /></>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
