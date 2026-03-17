import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudLightning, ChevronDown, UploadCloud, Share2, Lock, FolderPlus } from 'lucide-react';

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      icon: UploadCloud,
      question: 'How do I upload files to CloudShare?',
      answer: 'To upload files, sign in to your account and click the "Upload" button. You can drag and drop files or select them from your computer. CloudShare supports files up to 5GB in size.'
    },
    {
      icon: Share2,
      question: 'How can I share files with others?',
      answer: 'You can share files by clicking the share icon next to any file. Choose between creating a shareable link, sharing with specific email addresses, or adding files to a collaborative room. You can set expiration dates and download limits for shared links.'
    },
    {
      icon: Lock,
      question: 'Is my data secure on CloudShare?',
      answer: 'Yes! CloudShare uses end-to-end encryption for all file transfers and stores all files encrypted at rest. We never access your files and comply with GDPR and other data protection regulations.'
    },
    {
      icon: FolderPlus,
      question: 'What are Rooms and how do I use them?',
      answer: 'Rooms are collaborative spaces where multiple people can upload, download, and organize files together. Create a room, invite others via email, and work as a team. Perfect for project collaboration and file collection.'
    },
    {
      icon: CloudLightning,
      question: 'What storage limits are there?',
      answer: 'Free accounts get 5GB of storage. Pro accounts get 1TB, and Enterprise accounts get unlimited storage. Unused storage rolls over each month.'
    },
    {
      icon: Lock,
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email, and follow the link sent to your inbox. You\'ll have 30 minutes to set a new password.'
    },
    {
      icon: Share2,
      question: 'Can I password protect shared files?',
      answer: 'Yes! When creating a shared link, you can set a password that recipients must enter to access the files. You can also set an expiration date for the link.'
    },
    {
      icon: UploadCloud,
      question: 'Do you have versioning for files?',
      answer: 'Yes! CloudShare keeps a version history of all files. You can view and restore previous versions up to 30 days old on Pro and Enterprise plans.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CloudLightning size={28} className="text-blue-400" />
            <span className="text-xl font-bold">CloudShare</span>
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign In</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions about CloudShare
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: UploadCloud, title: 'Getting Started', desc: 'Upload your first file' },
            { icon: Share2, title: 'Sharing', desc: 'Share securely with others' },
            { icon: FolderPlus, title: 'Rooms', desc: 'Collaborate with teams' },
            { icon: Lock, title: 'Security', desc: 'Learn about our security' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors">
              <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <faq.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold">{faq.question}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-gray-400 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50 text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How To Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">How-To Guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Upload Your First File',
                steps: [
                  'Click the Upload button in your dashboard',
                  'Drag and drop your file or browse',
                  'File uploads automatically',
                  'Share using the share button'
                ]
              },
              {
                title: 'Create a Collaborative Room',
                steps: [
                  'Go to Rooms in the sidebar',
                  'Click "Create Room"',
                  'Name your room',
                  'Invite team members via email'
                ]
              },
              {
                title: 'Share a Secure Link',
                steps: [
                  'Select the file you want to share',
                  'Click the Share button',
                  'Choose "Create Link"',
                  'Set password and expiration (optional)'
                ]
              },
              {
                title: 'Organize with Folders',
                steps: [
                  'Click "Create Folder" in My Files',
                  'Name your folder',
                  'Drag files into the folder',
                  'Share entire folders with others'
                ]
              },
            ].map((guide, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-lg">{guide.title}</h3>
                <ol className="space-y-3">
                  {guide.steps.map((step, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {j + 1}
                      </span>
                      <span className="text-gray-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-gray-300 mb-6">
            Reach out to our support team for personalized help
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
