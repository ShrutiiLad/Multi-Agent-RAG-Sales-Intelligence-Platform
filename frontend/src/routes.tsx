import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ChatScreen from "@/pages/chat/ChatScreen";
import NewChat from "@/pages/chat/NewChat";
import UsersDirectory from "@/pages/admin/UsersDirectory";
import PromptTracking from "@/pages/admin/PromptTracking";
import PricingModule from "@/pages/admin/PricingModule";
// import Connections from "@/pages/agents/Connections";
import ManageAgents from "@/pages/agents/ManageAgents";
import ChatSecondarySidebar from "@/components/layout/dashboard/components/secondary-sidebars/chat-secondary-sidebar";
import AgentsSecondarySidebar from "@/components/layout/dashboard/components/secondary-sidebars/agents-secondary-sidebar";
import AdminSecondarySidebar from "@/components/layout/dashboard/components/secondary-sidebars/admin-secondary-sidebar";
import AuthRedirect from "@/services/auth/authRedirect";
import ReportPage from "@/pages/help/ReportPage";
import HelpSecondarySidebar from "@/components/layout/dashboard/components/secondary-sidebars/help-secondary-sidebar";
import FAQPage from "@/pages/help/FAQ";
import LoginPage from "@/pages/auth/Login";
import PrivacyPolicy from "@/pages/auth/PrivacyPolicy";
import SignUpPage from "@/pages/auth/Signup";
import ContentLibrary from "@/pages/agents/ContentLibrary";
import GuardedRoute from "@/components/helpers/auth-guard";
import RedirectIfAuthenticated from "@/components/helpers/redirect-if-authenticated";
import MaintenancePage from "@/pages/MaintenancePage";

const AppRoutes = () => {
  const isMaintenanceMode = false;

  return (
    <BrowserRouter>
      {isMaintenanceMode ? (
        <Routes>
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="*" element={<Navigate to="/maintenance" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route element={<GuardedRoute />}>
            <Route path="/" element={<HomePage />}>
              <Route path="" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatSecondarySidebar />}>
                <Route path="" element={<NewChat />} />
                <Route path="c/:id" element={<ChatScreen />} />
              </Route>
              <Route path="/admin/" element={<AdminSecondarySidebar />}>
                <Route
                  path=""
                  element={<Navigate to="users-directory" replace />}
                />
                <Route path="users-directory" element={<UsersDirectory />} />
                {/* <Route path="prompt-tracking" element={<PromptTracking />} /> */}
                {/* <Route path="pricing-module" element={<PricingModule />} /> */}
              </Route>
              <Route path="/agents/" element={<AgentsSecondarySidebar />}>
                <Route
                  path=""
                  element={<Navigate to="manage-agents" replace />}
                />
                {/* <Route path="/" element={null} /> */}
                <Route path="manage-agents" element={<ManageAgents />} />
                <Route path="content-library" element={<ContentLibrary />} />
                {/* <Route path="connections" element={<Connections />} /> @TODO: Hiding it for now */}
              </Route>
              {/* <Route path="/help/" element={<HelpSecondarySidebar />}>
                <Route path="" element={<Navigate to="report" replace />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="report" element={<ReportPage />} />
              </Route> */}
            </Route>
          </Route>
          <Route path="*" element={<AuthRedirect />} />{" "}
          {/* Use AuthRedirect for all unmatched routes */}
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default AppRoutes;

//TESTING DEPLOYMENT AGAIN
// ADDED FEEDBACK BY MESSAGE API
