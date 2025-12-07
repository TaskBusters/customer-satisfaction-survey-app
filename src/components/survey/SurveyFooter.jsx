import React from "react";
import { Footer } from "flowbite-react";
import { BsFacebook, BsTwitter, BsGithub } from "react-icons/bs"; // Example icons

export default function SurveyFooter() {
  // Use a dark blue background to match your header's aesthetic
  // Use the light gray background for the overall app (the default of your body)

  const currentYear = new Date().getFullYear();

  return (
    <Footer
      container
      className="mt-16 rounded-none bg-gray-50 dark:bg-gray-800 border-t border-gray-200"
    >
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="md:flex md:justify-between">
          {/* Logo and App Name Section (Optional) */}
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Customer Survey App
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your feedback drives improvement.
            </p>
          </div>

          {/* Link Section (Customize these links) */}
          <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title
                title="App"
                className="text-gray-900 dark:text-white"
              />
              <Footer.LinkGroup
                col
                className="text-gray-600 dark:text-gray-400"
              >
                <Footer.Link href="#">About</Footer.Link>
                <Footer.Link href="#">Services</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title
                title="Follow us"
                className="text-gray-900 dark:text-white"
              />
              <Footer.LinkGroup
                col
                className="text-gray-600 dark:text-gray-400"
              >
                <Footer.Link href="#">Github</Footer.Link>
                <Footer.Link href="#">Discord</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title
                title="Legal"
                className="text-gray-900 dark:text-white"
              />
              <Footer.LinkGroup
                col
                className="text-gray-600 dark:text-gray-400"
              >
                <Footer.Link href="#">Privacy Policy</Footer.Link>
                <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>

        <Footer.Divider />

        {/* Copyright and Social Media Icons */}
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright
            href="#"
            by="City Government of Valenzuela™" // Customized copyright text
            year={currentYear}
            className="text-gray-700 dark:text-gray-300"
          />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            {/* Icons with blue accent color on hover */}
            <Footer.Icon
              href="#"
              icon={BsFacebook}
              className="hover:text-blue-600 dark:hover:text-blue-500"
            />
            <Footer.Icon
              href="#"
              icon={BsTwitter}
              className="hover:text-blue-600 dark:hover:text-blue-500"
            />
            <Footer.Icon
              href="#"
              icon={BsGithub}
              className="hover:text-blue-600 dark:hover:text-blue-500"
            />
          </div>
        </div>
      </div>
    </Footer>
  );
}
