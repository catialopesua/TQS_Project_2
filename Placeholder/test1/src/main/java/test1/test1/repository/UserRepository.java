package test1.test1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import test1.test1.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
	User findByUsername(String username);
}
