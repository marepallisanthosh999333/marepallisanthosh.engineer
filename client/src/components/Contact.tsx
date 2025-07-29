import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter } from 'lucide-react';
import LeetCodeIcon from './LeetCodeIcon';
import { sendContactEmail } from '../utils/emailService';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFormSubmission();
  };

  const handleFormSubmission = async () => {
    console.log('Form submission started');
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
    const result = await sendContactEmail(formData);
    console.log('Email service result:', result);
    
    if (result.success) {
      console.log('Email sent successfully');
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      console.error('Email sending failed:', result.message);
      setSubmitStatus('error');
    }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 bg-white w-full">
      <div className="container mx-auto px-6 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Let's Work Together
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to bring your ideas to life? Let's discuss your project and create something amazing together.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-gray-900">Get In Touch</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <Mail size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Email</h4>
                    <a 
                      href="mailto:marepallisanthosh.999333@gmail.com"
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      marepallisanthosh.999333@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <Phone size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Phone</h4>
                    <a 
                      href="tel:+919701672073"
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      +91 9701672073
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <MapPin size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">Location</h4>
                    <a 
                      href="https://www.google.com/maps/place/Vijayawada,+Andhra+Pradesh,+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      Vijayawada, Andhra Pradesh
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 font-medium mb-4">Follow Me</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/marepallisanthosh999333"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl transition-colors duration-300"
                  >
                    <Github size={20} className="text-black" fill="currentColor" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/marepalli-santhosh-42b16a284/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl transition-colors duration-300"
                  >
                    <Linkedin size={20} className="text-black" fill="currentColor" />
                  </a>
                  <a
                    href="https://leetcode.com/u/marepallisanthosh999333/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl transition-colors duration-300"
                  >
                    <LeetCodeIcon size={20} className="text-black" />
                  </a>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h4 className="text-gray-900 font-medium mb-3">Response Time</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  I typically respond to all inquiries within 24 hours. For urgent projects, 
                  feel free to call or send a message on LinkedIn for faster communication.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Send a Message</h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="mb-8">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-2xl">
                    <p className="font-medium">✅ Message sent successfully!</p>
                    <p className="text-sm">Thank you for reaching out. I'll get back to you soon!</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
                    <p className="font-medium">❌ Failed to send message</p>
                    <p className="text-sm">Please try again or contact me directly at marepallisanthosh.999333@gmail.com</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;