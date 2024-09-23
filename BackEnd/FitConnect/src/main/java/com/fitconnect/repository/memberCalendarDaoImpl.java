package com.fitconnect.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.fitconnect.dto.memberCalendarDto;


@Repository
public class memberCalendarDaoImpl implements memberCalendarDao{

	// 의존객체 주입
	@Autowired SqlSession session;
	
	@Override
	public List<memberCalendarDto> getList(int user_num) {
		
		return session.selectList("calendar.getList", user_num);
	}

	@Override
	public memberCalendarDto getData(memberCalendarDto dto) {
		
		return session.selectOne("calendar.getData", dto);
	}

	@Override
	public void insert(memberCalendarDto dto) {
		
		session.insert("calendar.insert", dto);
	}

	@Override
	public void update(memberCalendarDto dto) {
		
		session.update("calendar.update", dto);
	}
	
	@Override
	public void delete(int member_num, int m_calendar_id) {
		Map<String, Object> params = new HashMap<>();
		params.put("member_num", member_num);
		params.put("m_calendar_id", m_calendar_id);
		
		session.delete("calendar.delete", params);
	}


}
