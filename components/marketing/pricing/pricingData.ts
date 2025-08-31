// Copied from frontend/src/content/pricing/pricingData.ts
export const pricingPlans: {
  id: string;
  name: string;
  price: string;
  description: string;
  popular: boolean;
  features: string[];
  link?: string;
}[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    description:
      'Teams looking to track assets and create fundamental preventive maintenance schedules with procedures.',
    popular: false,
    features: [
      'Unlimited work orders',
      'Recurring work orders',
      'Custom tasks',
      'Unlimited Request User Licenses',
      'Asset Management'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '10',
    description:
      'Teams looking to build efficient and strong preventive maintenance through machine status and manpower visibility.',
    popular: false,
    features: [
      'Everything in Basic plus:',
      'Preventive Maintenance Optimization',
      'Custom Checklists',
      'Inventory management/Costing',
      'Time and Manpower Tracking',
      '30 day Analytics & Reporting'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '15',
    description:
      'Departments that need to leverage insights and analytics to drive further maintenance growth and productivity.',
    popular: true,
    features: [
      'Everything in Starter plus:',
      'Multiple Inventory Lines',
      'Signature Capture',
      'Customizable Request Portal',
      'Mobile Offline Mode',
      'Advanced Analytics & Reporting'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 'Custom Pricing',
    description:
      'Organizations ready to capture maintenance & operations data to manage multiple locations & system customization.',
    popular: false,
    features: [
      'Everything in Professional plus:',
      'Workflow Automation',
      'Downtime Tracking',
      'Reliability Tracking',
      'Purchase Order Management',
      'Multi-site Module Support',
      'Standard API Access',
      'Custom Work Order Statuses',
      'Custom Integrations Support',
      'Customizable Dashboards',
      'Custom Roles',
      'Single Sign On'
    ]
  }
];

export const planFeatureCategories = [
  {
    name: 'Work Orders',
    features: [
      {
        name: 'Work Order Management',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Recurring Work Orders',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Custom Categories',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Data Importing',
        availability: {
          basic: false,
          starter: false,
          professional: true,
          business: true
        }
      },
      {
        name: 'Preventive Maintenance',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      }
    ]
  },
  {
    name: 'Work Requests',
    features: [
      {
        name: 'Internal Requests',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'External Request Portal',
        availability: {
          basic: false,
          starter: false,
          professional: false,
          business: true
        }
      },
      {
        name: 'Customizable Request Portal',
        availability: {
          basic: false,
          starter: false,
          professional: false,
          business: true
        }
      }
    ]
  },
  {
    name: 'Locations, Assets, and Parts',
    features: [
      {
        name: 'Location Management',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Asset Management',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Barcode Scanning',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Inventory Management',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Meter Readings',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'File Upload',
        availability: {
          basic: false,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Custom Asset Statuses',
        availability: {
          basic: false,
          starter: false,
          professional: true,
          business: true
        }
      },
      {
        name: 'Multiple Inventory Lines',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      },
      {
        name: 'Asset Downtime Tracking',
        availability: {
          basic: true,
          starter: true,
          professional: true,
          business: true
        }
      }
    ]
  }
];

