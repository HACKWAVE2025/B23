#!/usr/bin/env python3
"""
TimeLeap Backend API Testing Suite
Tests all backend endpoints for the TimeLeap historical monuments application
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Any

# Backend URL from frontend environment
BACKEND_URL = "https://monument-viz.preview.emergentagent.com/api"

class TimeLeapAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
    
    def test_get_all_sites(self):
        """Test GET /api/sites - Should return list of all sites"""
        try:
            response = self.session.get(f"{self.base_url}/sites")
            
            if response.status_code != 200:
                self.log_test("GET /api/sites", False, f"HTTP {response.status_code}", response.text)
                return False
            
            sites = response.json()
            
            # Validate response structure
            if not isinstance(sites, list):
                self.log_test("GET /api/sites", False, "Response is not a list", sites)
                return False
            
            if len(sites) == 0:
                self.log_test("GET /api/sites", False, "No sites returned", sites)
                return False
            
            # Check for expected sites
            site_ids = [site.get('id') for site in sites]
            expected_sites = ['hampi_virupaksha', 'nalanda_university', 'golconda_fort']
            
            missing_sites = [site for site in expected_sites if site not in site_ids]
            if missing_sites:
                self.log_test("GET /api/sites", False, f"Missing expected sites: {missing_sites}", sites)
                return False
            
            # Validate site structure
            for site in sites:
                required_fields = ['id', 'name', 'location', 'coordinates', 'year_built', 'description']
                missing_fields = [field for field in required_fields if field not in site]
                if missing_fields:
                    self.log_test("GET /api/sites", False, f"Site missing fields: {missing_fields}", site)
                    return False
            
            self.log_test("GET /api/sites", True, f"Successfully returned {len(sites)} sites with valid structure")
            return True
            
        except Exception as e:
            self.log_test("GET /api/sites", False, f"Exception: {str(e)}")
            return False
    
    def test_get_site_details(self):
        """Test GET /api/sites/hampi_virupaksha - Should return detailed site data"""
        try:
            site_id = "hampi_virupaksha"
            response = self.session.get(f"{self.base_url}/sites/{site_id}")
            
            if response.status_code != 200:
                self.log_test("GET /api/sites/{site_id}", False, f"HTTP {response.status_code}", response.text)
                return False
            
            site = response.json()
            
            # Validate required fields
            required_fields = ['id', 'name', 'location', 'coordinates', 'year_built', 'description', 'thumbnail_url', 'current_image_url']
            missing_fields = [field for field in required_fields if field not in site]
            if missing_fields:
                self.log_test("GET /api/sites/{site_id}", False, f"Missing fields: {missing_fields}", site)
                return False
            
            # Validate specific data
            if site['id'] != site_id:
                self.log_test("GET /api/sites/{site_id}", False, f"Wrong site ID returned: {site['id']}", site)
                return False
            
            if site['name'] != "Virupaksha Temple":
                self.log_test("GET /api/sites/{site_id}", False, f"Wrong site name: {site['name']}", site)
                return False
            
            self.log_test("GET /api/sites/{site_id}", True, f"Successfully returned site details for {site['name']}")
            return True
            
        except Exception as e:
            self.log_test("GET /api/sites/{site_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_get_site_timeline(self):
        """Test GET /api/sites/hampi_virupaksha/timeline - Should return timeline events"""
        try:
            site_id = "hampi_virupaksha"
            response = self.session.get(f"{self.base_url}/sites/{site_id}/timeline")
            
            if response.status_code != 200:
                self.log_test("GET /api/sites/{site_id}/timeline", False, f"HTTP {response.status_code}", response.text)
                return False
            
            timeline = response.json()
            
            if not isinstance(timeline, list):
                self.log_test("GET /api/sites/{site_id}/timeline", False, "Response is not a list", timeline)
                return False
            
            if len(timeline) == 0:
                self.log_test("GET /api/sites/{site_id}/timeline", False, "No timeline events returned", timeline)
                return False
            
            # Validate timeline event structure
            for event in timeline:
                required_fields = ['id', 'site_id', 'year', 'title', 'description', 'event_type']
                missing_fields = [field for field in required_fields if field not in event]
                if missing_fields:
                    self.log_test("GET /api/sites/{site_id}/timeline", False, f"Event missing fields: {missing_fields}", event)
                    return False
                
                if event['site_id'] != site_id:
                    self.log_test("GET /api/sites/{site_id}/timeline", False, f"Wrong site_id in event: {event['site_id']}", event)
                    return False
            
            self.log_test("GET /api/sites/{site_id}/timeline", True, f"Successfully returned {len(timeline)} timeline events")
            return True
            
        except Exception as e:
            self.log_test("GET /api/sites/{site_id}/timeline", False, f"Exception: {str(e)}")
            return False
    
    def test_get_site_facts(self):
        """Test GET /api/sites/hampi_virupaksha/facts - Should return facts list"""
        try:
            site_id = "hampi_virupaksha"
            response = self.session.get(f"{self.base_url}/sites/{site_id}/facts")
            
            if response.status_code != 200:
                self.log_test("GET /api/sites/{site_id}/facts", False, f"HTTP {response.status_code}", response.text)
                return False
            
            facts = response.json()
            
            if not isinstance(facts, list):
                self.log_test("GET /api/sites/{site_id}/facts", False, "Response is not a list", facts)
                return False
            
            if len(facts) == 0:
                self.log_test("GET /api/sites/{site_id}/facts", False, "No facts returned", facts)
                return False
            
            # Validate fact structure
            for fact in facts:
                required_fields = ['id', 'site_id', 'title', 'description', 'icon_type']
                missing_fields = [field for field in required_fields if field not in fact]
                if missing_fields:
                    self.log_test("GET /api/sites/{site_id}/facts", False, f"Fact missing fields: {missing_fields}", fact)
                    return False
                
                if fact['site_id'] != site_id:
                    self.log_test("GET /api/sites/{site_id}/facts", False, f"Wrong site_id in fact: {fact['site_id']}", fact)
                    return False
            
            self.log_test("GET /api/sites/{site_id}/facts", True, f"Successfully returned {len(facts)} facts")
            return True
            
        except Exception as e:
            self.log_test("GET /api/sites/{site_id}/facts", False, f"Exception: {str(e)}")
            return False
    
    def test_get_site_annotations(self):
        """Test GET /api/sites/hampi_virupaksha/annotations - Should return annotations"""
        try:
            site_id = "hampi_virupaksha"
            response = self.session.get(f"{self.base_url}/sites/{site_id}/annotations")
            
            if response.status_code != 200:
                self.log_test("GET /api/sites/{site_id}/annotations", False, f"HTTP {response.status_code}", response.text)
                return False
            
            annotations = response.json()
            
            if not isinstance(annotations, list):
                self.log_test("GET /api/sites/{site_id}/annotations", False, "Response is not a list", annotations)
                return False
            
            # Validate annotation structure (even if empty)
            for annotation in annotations:
                required_fields = ['id', 'site_id', 'user_name', 'content', 'timestamp', 'likes']
                missing_fields = [field for field in required_fields if field not in annotation]
                if missing_fields:
                    self.log_test("GET /api/sites/{site_id}/annotations", False, f"Annotation missing fields: {missing_fields}", annotation)
                    return False
                
                if annotation['site_id'] != site_id:
                    self.log_test("GET /api/sites/{site_id}/annotations", False, f"Wrong site_id in annotation: {annotation['site_id']}", annotation)
                    return False
            
            self.log_test("GET /api/sites/{site_id}/annotations", True, f"Successfully returned {len(annotations)} annotations")
            return True
            
        except Exception as e:
            self.log_test("GET /api/sites/{site_id}/annotations", False, f"Exception: {str(e)}")
            return False
    
    def test_create_annotation(self):
        """Test POST /api/sites/hampi_virupaksha/annotations - Create new annotation"""
        try:
            site_id = "hampi_virupaksha"
            annotation_data = {
                "site_id": site_id,
                "user_name": "Archaeological Explorer",
                "content": "The intricate stone carvings on the temple pillars showcase the exceptional craftsmanship of Vijayanagara artisans. Each pillar tells a unique story from Hindu mythology."
            }
            
            response = self.session.post(
                f"{self.base_url}/sites/{site_id}/annotations",
                json=annotation_data
            )
            
            if response.status_code != 200:
                self.log_test("POST /api/sites/{site_id}/annotations", False, f"HTTP {response.status_code}", response.text)
                return False
            
            created_annotation = response.json()
            
            # Validate created annotation structure
            required_fields = ['id', 'site_id', 'user_name', 'content', 'timestamp', 'likes']
            missing_fields = [field for field in required_fields if field not in created_annotation]
            if missing_fields:
                self.log_test("POST /api/sites/{site_id}/annotations", False, f"Created annotation missing fields: {missing_fields}", created_annotation)
                return False
            
            # Validate data matches input
            if created_annotation['site_id'] != annotation_data['site_id']:
                self.log_test("POST /api/sites/{site_id}/annotations", False, f"Site ID mismatch", created_annotation)
                return False
            
            if created_annotation['user_name'] != annotation_data['user_name']:
                self.log_test("POST /api/sites/{site_id}/annotations", False, f"User name mismatch", created_annotation)
                return False
            
            if created_annotation['content'] != annotation_data['content']:
                self.log_test("POST /api/sites/{site_id}/annotations", False, f"Content mismatch", created_annotation)
                return False
            
            # Validate defaults
            if created_annotation['likes'] != 0:
                self.log_test("POST /api/sites/{site_id}/annotations", False, f"Likes should default to 0", created_annotation)
                return False
            
            self.log_test("POST /api/sites/{site_id}/annotations", True, f"Successfully created annotation with ID: {created_annotation['id']}")
            return True
            
        except Exception as e:
            self.log_test("POST /api/sites/{site_id}/annotations", False, f"Exception: {str(e)}")
            return False
    
    def test_ai_chat(self):
        """Test POST /api/chat - Test AI chatbot with Gemini integration"""
        try:
            chat_data = {
                "session_id": "test_session_123",
                "site_id": "hampi_virupaksha",
                "message": "Tell me about Hampi's history and architectural significance"
            }
            
            response = self.session.post(
                f"{self.base_url}/chat",
                json=chat_data
            )
            
            if response.status_code != 200:
                self.log_test("POST /api/chat", False, f"HTTP {response.status_code}", response.text)
                return False
            
            chat_response = response.json()
            
            # Validate response structure
            required_fields = ['response', 'session_id']
            missing_fields = [field for field in required_fields if field not in chat_response]
            if missing_fields:
                self.log_test("POST /api/chat", False, f"Chat response missing fields: {missing_fields}", chat_response)
                return False
            
            # Validate session ID matches
            if chat_response['session_id'] != chat_data['session_id']:
                self.log_test("POST /api/chat", False, f"Session ID mismatch", chat_response)
                return False
            
            # Validate response content
            ai_response = chat_response['response']
            if not ai_response or len(ai_response.strip()) < 10:
                self.log_test("POST /api/chat", False, f"AI response too short or empty", chat_response)
                return False
            
            # Check if response seems relevant to Hampi
            hampi_keywords = ['hampi', 'vijayanagara', 'temple', 'architecture', 'history', 'karnataka']
            response_lower = ai_response.lower()
            if not any(keyword in response_lower for keyword in hampi_keywords):
                self.log_test("POST /api/chat", False, f"AI response doesn't seem relevant to Hampi", chat_response)
                return False
            
            self.log_test("POST /api/chat", True, f"Successfully received AI response ({len(ai_response)} characters)")
            return True
            
        except Exception as e:
            self.log_test("POST /api/chat", False, f"Exception: {str(e)}")
            return False
    
    def test_data_persistence(self):
        """Test MongoDB data persistence by verifying annotation was saved"""
        try:
            site_id = "hampi_virupaksha"
            
            # Get annotations before creating new one
            response_before = self.session.get(f"{self.base_url}/sites/{site_id}/annotations")
            if response_before.status_code != 200:
                self.log_test("Data Persistence Test", False, "Failed to get annotations before test")
                return False
            
            annotations_before = response_before.json()
            count_before = len(annotations_before)
            
            # Create new annotation
            annotation_data = {
                "site_id": site_id,
                "user_name": "Persistence Tester",
                "content": "Testing data persistence in MongoDB - this annotation should be saved permanently."
            }
            
            create_response = self.session.post(
                f"{self.base_url}/sites/{site_id}/annotations",
                json=annotation_data
            )
            
            if create_response.status_code != 200:
                self.log_test("Data Persistence Test", False, "Failed to create test annotation")
                return False
            
            # Get annotations after creating new one
            response_after = self.session.get(f"{self.base_url}/sites/{site_id}/annotations")
            if response_after.status_code != 200:
                self.log_test("Data Persistence Test", False, "Failed to get annotations after test")
                return False
            
            annotations_after = response_after.json()
            count_after = len(annotations_after)
            
            # Verify count increased
            if count_after != count_before + 1:
                self.log_test("Data Persistence Test", False, f"Annotation count didn't increase: {count_before} -> {count_after}")
                return False
            
            # Verify new annotation exists
            new_annotation = None
            for annotation in annotations_after:
                if annotation['user_name'] == "Persistence Tester":
                    new_annotation = annotation
                    break
            
            if not new_annotation:
                self.log_test("Data Persistence Test", False, "New annotation not found in database")
                return False
            
            self.log_test("Data Persistence Test", True, f"Successfully verified data persistence: {count_before} -> {count_after} annotations")
            return True
            
        except Exception as e:
            self.log_test("Data Persistence Test", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("TimeLeap Backend API Testing Suite")
        print("=" * 80)
        print(f"Testing backend at: {self.base_url}")
        print()
        
        tests = [
            self.test_get_all_sites,
            self.test_get_site_details,
            self.test_get_site_timeline,
            self.test_get_site_facts,
            self.test_get_site_annotations,
            self.test_create_annotation,
            self.test_ai_chat,
            self.test_data_persistence
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                failed += 1
            print()
        
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed == 0

if __name__ == "__main__":
    tester = TimeLeapAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)