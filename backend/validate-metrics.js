/**
 * Run Enterprise Validation
 * Execute this script to validate Vibe Score metrics against benchmark repositories
 */

import { EnterpriseValidator } from './src/utils/enterpriseValidation.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runValidation() {
  console.log('🚀 Vibe Score™ Enterprise Validation\n');
  console.log('This process validates our metrics against industry-leading repositories.');
  console.log('It may take several minutes to complete.\n');

  try {
    const validator = new EnterpriseValidator();
    const results = await validator.validateMetrics();
    
    console.log('\n📊 Validation Complete!\n');
    console.log(`Overall Accuracy: ${results.overallAccuracy.toFixed(1)}%`);
    console.log('\nCategory Results:');
    
    for (const [category, data] of Object.entries(results.categoryAccuracy)) {
      console.log(`- ${category}: ${data.accuracy.toFixed(1)}% accurate`);
    }
    
    console.log('\n✅ Validation reports generated successfully!');
    console.log('- JSON Report: validation-report.json');
    console.log('- Markdown Report: VALIDATION_REPORT.md');
    
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation
runValidation(); 