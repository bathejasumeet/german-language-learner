#!/usr/bin/env python3
"""
End-to-End Test Script for German Language Learner Application
Tests all three user stories: Vocabulary, Flashcards, and Quiz

Usage:
    python backend/tests/e2e/test_full_user_flow.py

Requirements:
    - Backend running on http://localhost:8000
    - PostgreSQL database running
    - All environment variables configured
"""

import requests
import json
import sys
from typing import Dict, List, Any
import time

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

class E2ETestRunner:
    def __init__(self):
        self.test_results = []
        self.word_ids = []
        self.quiz_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test progress"""
        print(f"[{level}] {message}")
    
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Track test result"""
        status = "PASS" if passed else "FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "details": details
        })
        self.log(f"[{status}] {test_name} {details}", "TEST" if passed else "ERROR")
    
    def print_summary(self):
        """Print test summary"""
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r["status"] == "PASS")
        failed = total - passed
        
        print("\n" + "="*60)
        print(f"E2E Test Summary: {passed}/{total} tests passed")
        print("="*60)
        
        for result in self.test_results:
            symbol = "✓" if result["status"] == "PASS" else "✗"
            print(f"{symbol} {result['test']}")
            if result["details"]:
                print(f"  Details: {result['details']}")
        
        print("="*60)
        return failed == 0

    # ==================== User Story 1: Vocabulary ====================
    
    def test_add_word(self, german_word: str, meaning: str) -> int:
        """Test adding a new word"""
        try:
            response = requests.post(
                f"{BASE_URL}/words",
                json={"german_word": german_word, "meaning": meaning},
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            word_data = response.json() if passed else {}
            word_id = word_data.get("id", -1)
            
            self.log_test(
                "Add Word",
                passed,
                f"Added '{german_word}' (ID: {word_id})"
            )
            
            if passed:
                self.word_ids.append(word_id)
                return word_id
            return -1
            
        except Exception as e:
            self.log_test("Add Word", False, f"Exception: {str(e)}")
            return -1

    def test_get_all_words(self) -> bool:
        """Test retrieving all words"""
        try:
            response = requests.get(
                f"{BASE_URL}/words",
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            words = response.json().get("data", []) if passed else []
            
            self.log_test(
                "Get All Words",
                passed,
                f"Retrieved {len(words)} words"
            )
            return passed
            
        except Exception as e:
            self.log_test("Get All Words", False, f"Exception: {str(e)}")
            return False

    def test_update_word(self, word_id: int) -> bool:
        """Test updating a word"""
        try:
            response = requests.put(
                f"{BASE_URL}/words/{word_id}",
                json={"meaning": "Updated meaning"},
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            self.log_test("Update Word", passed, f"Updated word ID {word_id}")
            return passed
            
        except Exception as e:
            self.log_test("Update Word", False, f"Exception: {str(e)}")
            return False

    def test_delete_word(self, word_id: int) -> bool:
        """Test deleting a word"""
        try:
            response = requests.delete(
                f"{BASE_URL}/words/{word_id}",
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            self.log_test("Delete Word", passed, f"Deleted word ID {word_id}")
            return passed
            
        except Exception as e:
            self.log_test("Delete Word", False, f"Exception: {str(e)}")
            return False

    # ==================== User Story 2: Flashcards ====================
    
    def test_create_flashcard(self, word_id: int) -> int:
        """Test creating a flashcard from a word"""
        try:
            response = requests.post(
                f"{BASE_URL}/flashcards",
                json={"word_id": word_id},
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            flashcard_data = response.json() if passed else {}
            flashcard_id = flashcard_data.get("id", -1)
            
            self.log_test(
                "Create Flashcard",
                passed,
                f"Created flashcard ID {flashcard_id} for word {word_id}"
            )
            return flashcard_id if passed else -1
            
        except Exception as e:
            self.log_test("Create Flashcard", False, f"Exception: {str(e)}")
            return -1

    def test_get_all_flashcards(self) -> bool:
        """Test retrieving all flashcards"""
        try:
            response = requests.get(
                f"{BASE_URL}/flashcards",
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            flashcards = response.json().get("data", []) if passed else []
            
            self.log_test(
                "Get All Flashcards",
                passed,
                f"Retrieved {len(flashcards)} flashcards"
            )
            return passed
            
        except Exception as e:
            self.log_test("Get All Flashcards", False, f"Exception: {str(e)}")
            return False

    def test_mark_flashcard_known(self, flashcard_id: int) -> bool:
        """Test marking a flashcard as known"""
        try:
            response = requests.post(
                f"{BASE_URL}/flashcards/{flashcard_id}/mark-known",
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            self.log_test(
                "Mark Flashcard Known",
                passed,
                f"Marked flashcard {flashcard_id} as known"
            )
            return passed
            
        except Exception as e:
            self.log_test("Mark Flashcard Known", False, f"Exception: {str(e)}")
            return False

    # ==================== User Story 3: Quiz & Progress ====================
    
    def test_create_quiz(self, num_questions: int = 5) -> int:
        """Test creating a quiz"""
        try:
            response = requests.post(
                f"{BASE_URL}/quiz",
                json={"num_questions": num_questions},
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            quiz_data = response.json() if passed else {}
            quiz_id = quiz_data.get("id", -1)
            
            self.log_test(
                "Create Quiz",
                passed,
                f"Created quiz ID {quiz_id} with {num_questions} questions"
            )
            if passed:
                self.quiz_id = quiz_id
            return quiz_id if passed else -1
            
        except Exception as e:
            self.log_test("Create Quiz", False, f"Exception: {str(e)}")
            return -1

    def test_submit_quiz(self, score: int) -> bool:
        """Test submitting quiz results"""
        if self.quiz_id is None:
            self.log_test("Submit Quiz", False, "No quiz created")
            return False
            
        try:
            response = requests.post(
                f"{BASE_URL}/quiz/{self.quiz_id}/submit",
                json={"score": score},
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            self.log_test(
                "Submit Quiz",
                passed,
                f"Submitted quiz with score {score}"
            )
            return passed
            
        except Exception as e:
            self.log_test("Submit Quiz", False, f"Exception: {str(e)}")
            return False

    def test_get_progress(self) -> bool:
        """Test retrieving user progress"""
        try:
            response = requests.get(
                f"{BASE_URL}/progress",
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code == 200
            progress_data = response.json() if passed else {}
            
            self.log_test(
                "Get Progress",
                passed,
                f"Retrieved progress data"
            )
            return passed
            
        except Exception as e:
            self.log_test("Get Progress", False, f"Exception: {str(e)}")
            return False

    def test_get_word_progress(self, word_id: int) -> bool:
        """Test retrieving progress for a specific word"""
        try:
            response = requests.get(
                f"{BASE_URL}/progress/word/{word_id}",
                headers=HEADERS,
                timeout=5
            )
            
            passed = response.status_code in [200, 404]  # 404 is ok if no progress yet
            self.log_test(
                "Get Word Progress",
                passed,
                f"Retrieved progress for word {word_id}"
            )
            return passed
            
        except Exception as e:
            self.log_test("Get Word Progress", False, f"Exception: {str(e)}")
            return False

    # ==================== Main Test Flow ====================
    
    def run_all_tests(self):
        """Run complete E2E test flow"""
        self.log("=" * 60, "")
        self.log("Starting E2E Test Flow for German Language Learner", "")
        self.log("=" * 60, "")
        
        # Test 1: Add words (User Story 1)
        self.log("\n📚 Testing User Story 1: Vocabulary Management", "")
        word1_id = self.test_add_word("Apfel", "Apple")
        word2_id = self.test_add_word("Buch", "Book")
        word3_id = self.test_add_word("Schule", "School")
        
        self.test_get_all_words()
        
        if word1_id > 0:
            self.test_update_word(word1_id)
        
        # Test 2: Flashcards (User Story 2)
        self.log("\n🃏 Testing User Story 2: Flashcard Study", "")
        if word1_id > 0:
            fc_id = self.test_create_flashcard(word1_id)
            if fc_id > 0:
                self.test_mark_flashcard_known(fc_id)
        
        self.test_get_all_flashcards()
        
        # Test 3: Quiz & Progress (User Story 3)
        self.log("\n📊 Testing User Story 3: Quiz & Progress", "")
        quiz_id = self.test_create_quiz(5)
        if quiz_id > 0:
            self.test_submit_quiz(3)  # 3 out of 5 correct
        
        self.test_get_progress()
        
        if word1_id > 0:
            self.test_get_word_progress(word1_id)
        
        # Cleanup: Delete test words
        self.log("\n🧹 Cleaning up test data", "")
        for word_id in self.word_ids:
            self.test_delete_word(word_id)
        
        # Print summary
        return self.print_summary()


def main():
    """Main entry point"""
    try:
        # Check if backend is running
        try:
            response = requests.get(f"{BASE_URL}/", timeout=2)
        except requests.exceptions.ConnectionError:
            print("ERROR: Backend not running at http://localhost:8000")
            print("Please start the backend with: docker-compose up")
            sys.exit(1)
        
        # Run tests
        runner = E2ETestRunner()
        success = runner.run_all_tests()
        
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"FATAL: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
