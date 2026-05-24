import { Card, CardBody, Tab, Tabs } from '@heroui/react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export function AuthTabs() {
  const [searchParams] = useSearchParams();

  // Check if we should default to signup tab
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  return (
    <motion.div {...fadeInUp}>
      <Card className="w-full max-w-lg">
        <CardBody className="gap-4">
          <Tabs
            defaultSelectedKey={defaultTab}
            aria-label="Authentication options"
            color="primary"
            variant="underlined"
            classNames={{
              tabList: 'gap-6 relative',
              cursor: 'w-full bg-primary-500 h-[2px] bottom-0',
              tab: 'max-w-fit px-0 h-12 text-lg group',
              tabContent:
                'group-data-[selected=true]:text-primary-500 transition-colors',
            }}
          >
            <Tab
              key="login"
              title={
                <div className="flex items-center space-x-2">
                  <span>Sign In</span>
                </div>
              }
            >
              <motion.div {...fadeInUp}>
                <LoginForm />
              </motion.div>
            </Tab>

            <Tab
              key="signup"
              title={
                <div className="flex items-center space-x-2">
                  <span>Create Account</span>
                </div>
              }
            >
              <motion.div {...fadeInUp}>
                <RegisterForm />
              </motion.div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </motion.div>
  );
}
